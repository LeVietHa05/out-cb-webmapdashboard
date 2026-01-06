import { Device, DeviceImage } from "../map";
import Image from "next/image";
import { Icon, DivIcon } from "leaflet";

export default function ImageList({ selectedDevice }: { selectedDevice: Device }) {
    if (selectedDevice.images && selectedDevice.images.length > 0)
        return (
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


        )
}