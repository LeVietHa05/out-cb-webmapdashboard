import { Device, EnvironmentData } from "../map";

export default function EnvirHistory({ selectedDevice }: { selectedDevice: Device }) {
    if (selectedDevice.environmentData && selectedDevice.environmentData.length > 0)
        return (
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
        )
}