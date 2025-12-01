'use client';

import { LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./marker-styles.css";
import { useState, useEffect } from "react";
import Image from "next/image";

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
        map.flyTo(center, zoom, {duration: 1});
    }, [center, zoom, map]);

    return null;
}

export default function Map() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLngTuple>([22.7301, 106.3373]);
    const [mapZoom, setMapZoom] = useState(14);

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
                            <button
                                onClick={() => setSelectedDevice(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Description */}
                        {selectedDevice.description && (
                            <p className="mb-4 text-gray-600">{selectedDevice.description}</p>
                        )}

                        {/* Status Alerts */}
                        <div className="mb-4 space-y-2">
                            {selectedDevice.isLandslide && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">⚠️</span>
                                        <div>
                                            <p className="font-bold">CẢNH BÁO SẠT LỞ ĐẤT</p>
                                            <p className="text-sm">Phát hiện nguy cơ sạt lở</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedDevice.isRoadSlippery && (
                                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-3 rounded">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">🌧️</span>
                                        <div>
                                            <p className="font-bold">Đường Trơn Trượt</p>
                                            <p className="text-sm">Mưa liên tục &gt; 10 phút</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedDevice.isFogging && (
                                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">🌫️</span>
                                        <div>
                                            <p className="font-bold">Sương Mù</p>
                                            <p className="text-sm">Độ ẩm cao, nhiệt độ thấp</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Latest Environment Data */}
                        {selectedDevice.latestEnvironment && (
                            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                                    <span className="mr-2">🌡️</span>
                                    Dữ Liệu Môi Trường
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Nhiệt độ</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {selectedDevice.latestEnvironment.temperature.toFixed(1)}°C
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Độ ẩm</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {selectedDevice.latestEnvironment.humidity.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm col-span-2">
                                        <p className="text-xs text-gray-500 mb-1">Trạng thái mưa</p>
                                        <p className="text-lg font-bold">
                                            {selectedDevice.latestEnvironment.isRaining ? (
                                                <span className="text-blue-600">🌧️ Đang mưa</span>
                                            ) : (
                                                <span className="text-gray-600">☀️ Không mưa</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Cập nhật: {new Date(selectedDevice.latestEnvironment.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        )}

                        {/* Images with License Plates */}
                        {selectedDevice.images && selectedDevice.images.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                                    <span className="mr-2">📷</span>
                                    Hình Ảnh ({selectedDevice.images.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedDevice.images.map((img: DeviceImage, i: number) => (
                                        <div key={i} className="border rounded-lg overflow-hidden shadow-sm">
                                            <Image 
                                                src={img.url} 
                                                alt="device image" 
                                                width={400} 
                                                height={300} 
                                                className="w-full"
                                            />
                                            <div className="p-3 bg-gray-50">
                                                {img.licensePlate && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Biển số xe:</span>
                                                        <span className="font-mono font-bold text-blue-600 bg-white px-3 py-1 rounded border-2 border-blue-600">
                                                            {img.licensePlate}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(img.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Environment History */}
                        {selectedDevice.environmentData && selectedDevice.environmentData.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                                    <span className="mr-2">📊</span>
                                    Lịch Sử Môi Trường
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {selectedDevice.environmentData.slice(0, 5).map((env: EnvironmentData, i: number) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded border text-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-gray-700">
                                                    {new Date(env.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                                {env.isRaining && <span className="text-blue-600">🌧️</span>}
                                            </div>
                                            <div className="flex gap-4 text-gray-600">
                                                <span>🌡️ {env.temperature.toFixed(1)}°C</span>
                                                <span>💧 {env.humidity.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
