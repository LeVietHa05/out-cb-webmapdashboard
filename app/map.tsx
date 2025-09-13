'use client';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";

export interface Device {
  id: number;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  images?: string[];
}

export default function Map() {
    const [devices, setDevices] = useState<Device[]>([]);

    useEffect(() => {
        fetch("/api/devices")
            .then((res) => res.json())
            .then((data) => setDevices(data));
    }, []);

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                {devices.map((d) => (
                    <Marker key={d.id} position={[d.lat, d.lng]}>
                        <Popup>
                            <b>{d.title}</b>
                            <p>{d.description}</p>
                            {d.images?.map((img: string, i: number) => (
                                <img key={i} src={img} alt="device image" width={100} />
                            ))}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
