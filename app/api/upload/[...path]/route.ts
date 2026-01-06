/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { stat } from 'fs/promises';

interface RouteParams {
    params: Promise<{ path: string[] }>;
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        const { path: pathParts } = await params;

        if (!pathParts || pathParts.length === 0) {
            return NextResponse.json(
                { error: 'File path is required' },
                { status: 400 }
            );
        }

        // Xây dựng đường dẫn tuyệt đối
        const filePath = path.join(
            process.cwd(),
            'public',
            'uploads',
            ...pathParts
        );

        // Kiểm tra file tồn tại
        try {
            await stat(filePath);
        } catch {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        // Đọc file
        const fileBuffer = await fs.promises.readFile(filePath);

        // Xác định Content-Type
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.txt': 'text/plain',
            '.json': 'application/json',
            '.xml': 'application/xml',
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';

        const uint8Array = new Uint8Array(fileBuffer)
        // Trả về file
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Cấu hình để tránh giới hạn kích thước file
export const config = {
    api: {
        responseLimit: false,
        bodyParser: false,
    },
};