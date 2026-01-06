'use client';

import { LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./marker-styles.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import StatusAlert from "./compoments/StatusAlert";
import LastestEnvirCard from "./compoments/LastestEnvirCard";
import ImageList from "./compoments/ImageList";
import EnvirHistory from "./compoments/EnvirHistory";

export interface EnvironmentData {
    temperature: number;
    humidity: number;
    isRaining: boolean;
    createdAt: string;
}

export interface DeviceImage {
    url: string;
    licensePlate?: string;
    createdAt: string;
}

export interface Device {
    id: number;
    title: string;
    description?: string;
    lat: number;
    lng: number;
    lastUploadAt?: string;
    isFogging: boolean;
    isRoadSlippery: boolean;
    isLandslide: boolean;
    images?: DeviceImage[];
    environmentData?: EnvironmentData[];
    latestEnvironment?: EnvironmentData | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MapController({ center, zoom }: { center: any, zoom: number }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1 });
    }, [center, zoom, map]);

    return null;
}

export default function Map() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLngTuple>([22.7301, 106.3373]);
    const [mapZoom, setMapZoom] = useState(12);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        lat: '',
        lng: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMarkerClick = (device: Device) => {
        console.log('Marker clicked for device:', device);
        setSelectedDevice(device);

        // Center và zoom vào marker
        setMapCenter([device.lat, device.lng]);
        setMapZoom(16); // Zoom level bạn muốn
    };

    // Function to check if device is active (uploaded within 60 seconds)
    const isDeviceActive = (device: Device) => {
        if (device.lastUploadAt) {
            const lastUploadTime = new Date(device.lastUploadAt).getTime();
            const currentTime = Date.now();
            const timeDiff = currentTime - lastUploadTime;
            const sixtySeconds = 60 * 1000;
            return timeDiff <= sixtySeconds;
        }
        return false;
    };

    // Function to check if device has detected cars
    const hasDetectedCars = (device: Device) => {
        return device.images?.some(img => img.licensePlate) || false;
    };

    // Function to create custom marker with multiple status badges
    const createCustomMarker = (device: Device) => {
        const isActive = isDeviceActive(device);
        const hasCars = hasDetectedCars(device);

        // Base marker color - black background with colored border
        const borderColor = isActive ? '#ef4444' : '#22c55e'; // red or green border
        const markerSize = isActive ? 50 : 40; // Increased size

        // Create badges HTML
        const badges = [];

        if (device.isLandslide) {
            badges.push('<div class="status-badge bg-red-600" title="Cảnh báo sạt lở">⚠️</div>');
        }
        if (device.isRoadSlippery) {
            badges.push('<div class="status-badge bg-orange-500" title="Đường trơn trượt">🌧️</div>');
        }
        if (device.isFogging) {
            badges.push('<div class="status-badge bg-yellow-500" title="Sương mù">🌫️</div>');
        }
        if (hasCars) {
            badges.push('<div class="status-badge bg-blue-600" title="Phát hiện xe">🚗</div>');
        }

        const badgesHtml = badges.length > 0
            ? `<div class="status-badges">${badges.join('')}</div>`
            : '';

        const html = `
            <div class="custom-marker-container">
                <div class="main-marker" style="background-color: #000000; border: 4px solid ${borderColor}; width: ${markerSize}px; height: ${markerSize}px;">
                    <div class="marker-pulse" style="border-color: ${borderColor};"></div>
                    <div class="marker-icon">${!isActive ? '🔴' : '🟢'}</div>
                </div>
                ${badgesHtml}
            </div>
        `;

        return new DivIcon({
            html: html,
            className: 'custom-div-icon',
            iconSize: [markerSize + 10, markerSize + 30],
            iconAnchor: [(markerSize + 10) / 2, markerSize],
        });
    };

    useEffect(() => {
        fetch("/api/devices")
            .then((res) => res.json())
            .then((data) => setDevices(data));
    }, []);

    const saveEdit = async function (selectedDevice: Device) {

        if (!editForm.title.trim()) {
            setError('Tiêu đề không được để trống');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/devices/${selectedDevice.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editForm.title.trim(),
                    description: editForm.description.trim() || undefined,
                    lat: parseFloat(editForm.lat),
                    lng: parseFloat(editForm.lng),
                }),
            });

            if (!response.ok) {
                throw new Error('Cập nhật thiết bị thất bại');
            }

            const updatedDevice = await response.json();

            // Update the device in the local state
            setDevices(prev => prev.map(d =>
                d.id === selectedDevice.id ? { ...d, ...updatedDevice } : d
            ));

            // Update selected device
            setSelectedDevice(prev => prev ? { ...prev, ...updatedDevice } : null);

            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }

    }

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
                <MapController center={mapCenter} zoom={mapZoom} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                {devices.map((d) => (
                    <Marker
                        key={d.id}
                        position={[d.lat, d.lng]}
                        icon={createCustomMarker(d)}
                        eventHandlers={{
                            click: () => handleMarkerClick(d),
                        }}
                    />
                ))}
            </MapContainer>
            {/* Modal for selected device */}
            {selectedDevice && (
                <div onClick={() => setSelectedDevice(null)} className="fixed inset-0 bg-black/30 z-[10000]">
                    <div onClick={(e) => e.stopPropagation()} className="fixed top-4 right-4 bottom-4 w-96 bg-white p-6 rounded-lg max-w-md w-full overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 pb-4 border-b">
                            <h2 className="text-xl font-bold text-gray-800">{selectedDevice.title}</h2>
                            <div className="flex items-center gap-2">
                                {!isEditing && (
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditForm({
                                                title: selectedDevice.title,
                                                description: selectedDevice.description || '',
                                                lat: selectedDevice.lat.toString(),
                                                lng: selectedDevice.lng.toString()
                                            });
                                            setError(null);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-600 rounded"
                                    >
                                        ✏️ Chỉnh sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedDevice(null);
                                        setIsEditing(false);
                                        setError(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Edit Form or Description */}
                        {isEditing ? (
                            <div className="mb-4 space-y-4">
                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tiêu đề
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tiêu đề thiết bị"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Nhập mô tả thiết bị"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vĩ độ (Lat)
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={editForm.lat}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, lat: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="22.7301"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kinh độ (Lng)
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={editForm.lng}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, lng: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="106.3373"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => saveEdit(selectedDevice)}
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setError(null);
                                        }}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            selectedDevice.description && (
                                <p className="mb-4 text-gray-600">{selectedDevice.description}</p>
                            )
                        )}

                        {/* Status Alerts */}
                        <StatusAlert selectedDevice={selectedDevice} />

                        {/* Latest Environment Data */}
                        <LastestEnvirCard selectedDevice={selectedDevice} />

                        {/* Images with License Plates */}
                        <ImageList selectedDevice={selectedDevice} />

                        {/* Environment History */}
                        <EnvirHistory selectedDevice={selectedDevice} />
                    </div>
                </div>
            )}


        </div>
    );
}
