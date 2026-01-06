import { Device } from "../map";

export default function LastestEnvirCard({ selectedDevice }: { selectedDevice: Device }) {
    if (selectedDevice.latestEnvironment)
        return (
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
        )
}