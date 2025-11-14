import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Device, Image, EnvironmentData } from "@prisma/client";

export async function GET() {
  // this need to be refactor, can do findmany every single time
  const devices = await db.device.findMany({
    include: { 
      images: {
        orderBy: {createdAt: 'desc'},
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
        url: `/uploads/${img.url}`,
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
