
import { Device } from "../map"

export default function StatusAlert({ selectedDevice }: { selectedDevice: Device }) {
    return (
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
    )
}