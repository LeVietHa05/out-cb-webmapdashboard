'use client';

import { LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import Image from "next/image";

export interface Device {
    id: number;
    title: string;
    description?: string;
    lat: number;
    lng: number;
    lastUploadAt?: string; // ISO date string
    images?: string[];
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
    const [mapCenter, setMapCenter] = useState<LatLngTuple>([21.0285, 105.8542]);
    const [mapZoom, setMapZoom] = useState(13);

    // Create custom icons
    const greenIcon = new Icon({
        iconUrl: '/maker-green-small.svg',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const redIcon = new Icon({
        iconUrl: '/maker-red-big.svg',
        iconSize: [35, 57],
        iconAnchor: [17, 57],
        popupAnchor: [1, -34],
    });

    const handleMarkerClick = (device: Device) => {
        console.log('Marker clicked for device:', device);
        setSelectedDevice(device);

        // Center và zoom vào marker
        setMapCenter([device.lat, device.lng]);
        setMapZoom(16); // Zoom level bạn muốn
    };

    // Function to get the appropriate icon for a device
    const getDeviceIcon = (device: Device) => {
        if (device.lastUploadAt) {
            const lastUploadTime = new Date(device.lastUploadAt).getTime();
            const currentTime = Date.now();
            const timeDiff = currentTime - lastUploadTime;
            const sixtySeconds = 60 * 1000; // 60 seconds in milliseconds

            if (timeDiff <= sixtySeconds) {
                return redIcon;
            }
        }
        return greenIcon;
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
                        icon={getDeviceIcon(d)}
                        eventHandlers={{
                            click: () => handleMarkerClick(d),
                        }}
                    />
                ))}
            </MapContainer>
            {/* Modal for selected device */}
            {selectedDevice && (
                <div onClick={() => setSelectedDevice(null)} className="fixed inset-0 bg-black/30 z-[10000]">
                    <div onClick={(e) => e.stopPropagation()} className="fixed top-4 right-4 bottom-4 w-96 bg-white p-6 rounded-lg max-w-md w-full overflow-y-auto ">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{selectedDevice.title}</h2>
                            <button
                                onClick={() => setSelectedDevice(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <p className="mb-4">{selectedDevice.description}</p>
                        {selectedDevice.images && selectedDevice.images.length > 0 && (
                            <div className="space-y-2">
                                {selectedDevice.images.map((img: string, i: number) => (
                                    <Image key={i} src={img} alt="device image" width={400} height={300} className="w-full rounded" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
