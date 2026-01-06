/* eslint-disable @next/next/no-img-element */
'use client'
import { useState, useRef } from 'react';

interface ImageInput {
    url: string;
    title?: string;
    content?: string;
    licensePlate?: string;
    createdAt?: string;
}

interface EnvironmentInput {
    temperature?: string;
    humidity?: string;
    isRaining: boolean;
    createdAt?: string;
}

interface DeviceFormData {
    title: string;
    description: string;
    lat: string;
    lng: string;
    createdAt?: string;
    environment: EnvironmentInput;
    images: ImageInput[];
}

interface UploadingFile {
    id: string,
    file: File,
    name: string
}

export default function CreateDeviceForm() {
    // State chính
    const [newDevice, setNewDevice] = useState<DeviceFormData>({
        title: '',
        description: '',
        lat: '',
        lng: '',
        createdAt: '',
        environment: {
            temperature: '',
            humidity: '',
            isRaining: false,
            createdAt: ''
        },
        images: []
    });

    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // State cho upload ảnh
    type UploadProgress = Record<string, number>;
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]); // Danh sách file đang upload
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({}); // Tiến độ upload

    // Xử lý chọn file
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const fileArray = Array.from(files);


        for (const file of fileArray) {
            // Thêm file vào danh sách đang upload
            const tempId = Date.now() + Math.random();
            setUploadingFiles(prev => [...prev, { id: String(tempId), file, name: file.name }]);

            try {
                // Upload file lên server
                type DataUpload = {
                    url: string,
                    fileName: string,
                    size: string,
                    type: string,
                }
                const dataUpload = await uploadImage(file, String(tempId));
                const uploadedUrl = (dataUpload as DataUpload).url

                // Khi upload thành công, thêm vào danh sách ảnh của device
                setNewDevice(prev => ({
                    ...prev,
                    images: [
                        ...prev.images,
                        {
                            url: uploadedUrl,
                            title: (dataUpload as DataUpload).fileName, // Lấy tên file làm tiêu đề
                            content: '',
                            licensePlate: '',
                            createdAt: ''
                        }
                    ]
                }));

            } catch (error) {
                console.error('Upload failed:', error);
                if (error instanceof Error) {
                    setCreateError(`Upload ảnh "${file.name}" thất bại: ${error.message}`);
                } else {
                    setCreateError(`Upload ảnh "${file.name}" thất bại`);
                }
            } finally {
                // Xóa khỏi danh sách đang upload
                setUploadingFiles(prev => prev.filter(f => f.id !== String(tempId)));
            }
        }
    };

    // Hàm upload ảnh
    const uploadImage = async (file: File, fileId: string) => {
        const formData = new FormData();
        formData.append('file', file);

        // Sử dụng XMLHttpRequest để tracking progress
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Theo dõi tiến độ
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(prev => ({
                        ...prev,
                        [fileId]: percentComplete
                    }));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    // Xóa progress khi hoàn thành
                    setUploadProgress(prev => {
                        const newProgress = { ...prev };
                        delete newProgress[fileId];
                        return newProgress;
                    });
                    resolve(data);
                } else {
                    reject(new Error('Upload failed'));
                }
            };

            xhr.onerror = () => reject(new Error('Upload failed'));

            xhr.open('POST', '/api/upload');
            xhr.send(formData);
        });
    };

    // Component hiển thị file đang upload
    const UploadingFileItem = ({ file }: { file: UploadingFile }) => (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200 mb-2">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                        {file.name}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[file.id] || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            <span className="text-xs text-gray-500">
                {uploadProgress[file.id] || 0}%
            </span>
        </div>
    );

    // Component hiển thị ảnh đã upload
    const UploadedImageItem = ({ image, index }: { image: ImageInput, index: number }) => (
        <div className="mb-4 p-3 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden mr-3">

                        <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/api/upload/1757759010844-marker-icon-2x.png';
                            }}
                        />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{image.title || `Ảnh ${index + 1}`}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{image.url}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="text-red-500 hover:text-red-700"
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-600 mb-1">
                        Tiêu đề
                    </label>
                    <input
                        type="text"
                        value={image.title || ''}
                        onChange={(e) => updateImageField(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Tiêu đề ảnh"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-600 mb-1">
                        Biển số xe
                    </label>
                    <input
                        type="text"
                        value={image.licensePlate || ''}
                        onChange={(e) => updateImageField(index, 'licensePlate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Biển số (nếu có)"
                    />
                </div>
            </div>

            <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">
                    Mô tả
                </label>
                <textarea
                    value={image.content || ''}
                    onChange={(e) => updateImageField(index, 'content', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    rows={2}
                    placeholder="Mô tả ảnh"
                />
            </div>

            <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">
                    Thời gian chụp
                </label>
                <input
                    type="datetime-local"
                    value={image.createdAt || ''}
                    onChange={(e) => updateImageField(index, 'createdAt', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
            </div>
        </div>
    );

    // Xóa field ảnh
    const removeImageField = (index: number) => {
        setNewDevice(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Cập nhật field ảnh
    const updateImageField = (index: number, field: string, value: string) => {
        setNewDevice(prev => {
            const updatedImages = [...prev.images];
            updatedImages[index] = {
                ...updatedImages[index],
                [field]: value
            };
            return {
                ...prev,
                images: updatedImages
            };
        });
    };


    // Hàm tạo thiết bị mới
    const createNewDevice = async () => {
        // Validate
        if (!newDevice.title || !newDevice.lat || !newDevice.lng) {
            setCreateError('Vui lòng điền tiêu đề, vĩ độ và kinh độ');
            return;
        }

        // Validate ảnh
        for (let i = 0; i < newDevice.images.length; i++) {
            if (!newDevice.images[i].url) {
                setCreateError(`Vui lòng nhập URL cho ảnh #${i + 1}`);
                return;
            }
        }

        setCreating(true);
        setCreateError(null);

        try {
            // Format data để gửi lên API
            const deviceData = {
                title: newDevice.title,
                description: newDevice.description || '',
                lat: parseFloat(newDevice.lat),
                lng: parseFloat(newDevice.lng),
                ...(newDevice.createdAt && { createdAt: newDevice.createdAt }),
                environment: newDevice.environment.temperature || newDevice.environment.humidity
                    ? {
                        temperature: newDevice.environment.temperature ? parseFloat(newDevice.environment.temperature) : null,
                        humidity: newDevice.environment.humidity ? parseFloat(newDevice.environment.humidity) : null,
                        isRaining: newDevice.environment.isRaining,
                        ...(newDevice.environment.createdAt && { createdAt: newDevice.environment.createdAt })
                    }
                    : null,
                images: newDevice.images.filter(img => img.url).map(img => ({
                    url: img.title,
                    title: img.title || '',
                    content: img.content || '',
                    licensePlate: img.licensePlate || '',
                    ...(img.createdAt && { createdAt: img.createdAt })
                }))
            };

            const response = await fetch('/api/devices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deviceData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create device');
            }

            const createdDevice = await response.json();

            // Reset form
            resetForm();

            // Thông báo thành công
            alert(`Thiết bị "${createdDevice.title}" đã được tạo thành công với ${createdDevice.images?.length || 0} ảnh!`);

            // Gọi callback nếu có


        } catch (error) {
            console.error('Error creating device:', error);
            setCreateError('Lỗi khi tạo thiết bị');
        } finally {
            setCreating(false);
        }
    };


    // Reset form
    const resetForm = () => {
        setNewDevice({
            title: '',
            description: '',
            lat: '',
            lng: '',
            createdAt: '',
            environment: {
                temperature: '',
                humidity: '',
                isRaining: false,
                createdAt: ''
            },
            images: []
        });
        setCreateError(null);
    };

    return (
        <div className="mb-6 p-6 border border-gray-300 rounded-lg bg-white">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Thêm thiết bị mới</h3>

            <div className="space-y-6">
                {createError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {createError}
                    </div>
                )}

                {/* Thông tin cơ bản */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-700">Thông tin thiết bị</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề *
                            </label>
                            <input
                                type="text"
                                value={newDevice.title}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="VD: Camera giao thông Q1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thời gian tạo thiết bị
                            </label>
                            <input
                                type="datetime-local"
                                value={newDevice.createdAt}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, createdAt: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={newDevice.description}
                            onChange={(e) => setNewDevice(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            placeholder="Mô tả chi tiết về thiết bị, vị trí lắp đặt..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vĩ độ (Lat) *
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={newDevice.lat}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, lat: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="10.762622"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kinh độ (Lng) *
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={newDevice.lng}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, lng: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="106.660172"
                            />
                        </div>
                    </div>
                </div>

                {/* Dữ liệu môi trường */}
                <div className="border-t pt-4">
                    <h4 className="text-md font-medium mb-3">Dữ liệu môi trường</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nhiệt độ (°C)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={newDevice.environment?.temperature || ''}
                                onChange={(e) => setNewDevice(prev => ({
                                    ...prev,
                                    environment: {
                                        ...prev.environment,
                                        temperature: e.target.value
                                    }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="25.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Độ ẩm (%)
                            </label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                max="100"
                                value={newDevice.environment?.humidity || ''}
                                onChange={(e) => setNewDevice(prev => ({
                                    ...prev,
                                    environment: {
                                        ...prev.environment,
                                        humidity: e.target.value
                                    }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="70"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isRaining"
                                checked={newDevice.environment?.isRaining || false}
                                onChange={(e) => setNewDevice(prev => ({
                                    ...prev,
                                    environment: {
                                        ...prev.environment,
                                        isRaining: e.target.checked
                                    }
                                }))}
                                className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="isRaining" className="ml-2 text-sm text-gray-700">
                                Có mưa
                            </label>
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thời gian dữ liệu môi trường
                        </label>
                        <input
                            type="datetime-local"
                            value={newDevice.environment?.createdAt || ''}
                            onChange={(e) => setNewDevice(prev => ({
                                ...prev,
                                environment: {
                                    ...prev.environment,
                                    createdAt: e.target.value
                                }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>


                {/* Upload ảnh - TÍCH HỢP TRỰC TIẾP */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-700">
                            Ảnh đính kèm ({newDevice.images.length})
                        </h4>
                        <div className="flex gap-2">
                            {/* Nút upload file */}
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <label
                                htmlFor="image-upload"
                                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Thêm ảnh
                            </label>

                            {/* Nút thêm bằng URL (nếu vẫn muốn giữ option này) */}
                            <button
                                type="button"
                                onClick={() => setNewDevice(prev => ({
                                    ...prev,
                                    images: [...prev.images, { url: '', title: '', content: '', licensePlate: '', createdAt: '' }]
                                }))}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >
                                + URL thủ công
                            </button>
                        </div>
                    </div>

                    {/* Vùng kéo thả file */}
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('image-upload')?.click()}
                    >
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 font-medium">Kéo thả ảnh vào đây hoặc nhấn để chọn</p>
                        <p className="text-sm text-gray-500 mt-1">Hỗ trợ PNG, JPG, GIF, WebP (tối đa 5MB mỗi ảnh)</p>
                    </div>

                    {/* Hiển thị file đang upload */}
                    {uploadingFiles.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-medium text-blue-700 mb-2">Đang upload ({uploadingFiles.length})</h5>
                            {uploadingFiles.map((file, idx) => (
                                <UploadingFileItem key={idx} file={file} />
                            ))}
                        </div>
                    )}

                    {/* Hiển thị ảnh đã upload */}
                    {newDevice.images.length > 0 ? (
                        <div className="space-y-3">
                            {newDevice.images.map((image, index) => (
                                <UploadedImageItem key={index} image={image} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            <p>Chưa có ảnh nào được thêm</p>
                            <p className="text-sm mt-1">Hãy upload ảnh hoặc thêm bằng URL</p>
                        </div>
                    )}
                </div>

                {/* Nút tạo device */}
                <div className="pt-6 border-t">
                    <div className="flex gap-3">
                        <button
                            onClick={createNewDevice}
                            disabled={creating || uploadingFiles.length > 0}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Đang tạo thiết bị...
                                </>
                            ) : (
                                'Tạo thiết bị với dữ liệu'
                            )}
                        </button>

                        <button
                            onClick={resetForm}
                            type="button"
                            disabled={uploadingFiles.length > 0}
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                            Làm mới
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-3 text-center">
                        {newDevice.images.length} ảnh sẽ được đính kèm vào thiết bị
                    </p>
                </div>
            </div>
        </div>
    );
};