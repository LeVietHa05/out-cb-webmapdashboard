/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Device, Image, EnvironmentData } from "@prisma/client";

export async function GET() {
  // this need to be refactor, can do findmany every single time
  const devices = await db.device.findMany({
    include: {
      images: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      envirs: {
        orderBy: { createdAt: 'desc' },
        take: 10, // Get last 10 environment readings
      },
    },
  });

  return NextResponse.json(
    devices.map((d: Device & { images: Image[], envirs: EnvironmentData[] }) => ({
      id: d.id,
      title: d.title,
      lat: d.lat,
      lng: d.lng,
      description: d.description,
      lastUploadAt: d.lastUploadAt,
      isFogging: d.isFogging,
      isRoadSlippery: d.isRoadSlippery,
      isLandslide: d.isLandslide,
      images: d.images.map((img: Image) => ({
        url: `/api/upload/${img.url}`,
        licensePlate: img.licensePlate,
        createdAt: img.createdAt,
      })),
      environmentData: d.envirs.map((env: EnvironmentData) => ({
        temperature: env.temperature,
        humidity: env.humidity,
        isRaining: env.isRaining,
        createdAt: env.createdAt,
      })),
      latestEnvironment: d.envirs[0] || null,
    }))
  );
}

// /api/devices route - POST handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      lat,
      lng,
      createdAt,
      environment,
      images
    } = body;

    if (!title || !lat || !lng) {
      return NextResponse.json(
        { error: "Missing required fields: title, lat, lng" },
        { status: 400 }
      );
    }

    // Tạo thiết bị với transaction để bao gồm cả ảnh và dữ liệu môi trường
    const device = await db.$transaction(async (prisma) => {
      // Tạo thiết bị
      const deviceData: any = {
        title,
        description,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };

      if (createdAt) {
        deviceData.createdAt = new Date(createdAt);
      }

      const device = await prisma.device.create({
        data: deviceData,
      });

      // Tạo dữ liệu môi trường nếu có
      if (environment && (environment.temperature || environment.humidity)) {
        const envData: any = {
          deviceId: device.id,
          temperature: environment.temperature ? parseFloat(environment.temperature) : 0,
          humidity: environment.humidity ? parseFloat(environment.humidity) : 0,
          isRaining: environment.isRaining || false,
        };

        if (environment.createdAt) {
          envData.createdAt = new Date(environment.createdAt);
        }

        await prisma.environmentData.create({
          data: envData,
        });
      }

      // Tạo ảnh nếu có
      if (images && images.length > 0) {
        for (const img of images) {
          if (img.url) {
            const imageData: any = {
              deviceId: device.id,
              url: img.url,
              title: img.title || null,
              content: img.content || null,
              licensePlate: img.licensePlate || null,
            };

            if (img.createdAt) {
              imageData.createdAt = new Date(img.createdAt);
            }

            await prisma.image.create({
              data: imageData,
            });
          }
        }
      }

      // Lấy lại thiết bị với đầy đủ quan hệ
      return prisma.device.findUnique({
        where: { id: device.id },
        include: {
          images: true,
          envirs: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    console.error("Error creating device:", error);
    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 500 }
    );
  }
}
