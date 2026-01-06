
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { stat } from 'fs/promises';

interface RouteParams {
    params: Promise<{ path: string[] }>;
}


export async function POST(request: { formData: () => any; }) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'Không có file nào được chọn' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP)' },
                { status: 400 }
            );
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File quá lớn (tối đa 5MB)' },
                { status: 400 }
            );
        }

        // Tạo tên file duy nhất
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const now = Date.now()

        const fileName = `${now}_${file.name}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);

        // Lưu file
        fs.writeFile(filePath, buffer, () => {
            console.log("saved or failed")
        });

        // Trả về URL
        const fileUrl = `/api/upload/${fileName}`;

        return NextResponse.json({
            url: fileUrl,
            fileName: fileName,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload ảnh thất bại' },
            { status: 500 }
        );
    }
}