import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Device, Image, EnvironmentData } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = parseInt(params.id);

    if (isNaN(deviceId)) {
      return NextResponse.json(
        { error: "Invalid device ID" },
        { status: 400 }
      );
    }

    const device = await db.device.findUnique({
      where: { id: deviceId },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        envirs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: device.id,
      title: device.title,
      lat: device.lat,
      lng: device.lng,
      description: device.description,
      lastUploadAt: device.lastUploadAt,
      isFogging: device.isFogging,
      isRoadSlippery: device.isRoadSlippery,
      isLandslide: device.isLandslide,
      images: device.images.map((img: Image) => ({
        url: `/uploads/${img.url}`,
        licensePlate: img.licensePlate,
        createdAt: img.createdAt,
      })),
      environmentData: device.envirs.map((env: EnvironmentData) => ({
        temperature: env.temperature,
        humidity: env.humidity,
        isRaining: env.isRaining,
        createdAt: env.createdAt,
      })),
      latestEnvironment: device.envirs[0] || null,
    });
  } catch (error) {
    console.error("Error fetching device:", error);
    return NextResponse.json(
      { error: "Failed to fetch device" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = parseInt(params.id);

    if (isNaN(deviceId)) {
      return NextResponse.json(
        { error: "Invalid device ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, lat, lng } = body;

    const device = await db.device.update({
      where: { id: deviceId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(lat && { lat: parseFloat(lat) }),
        ...(lng && { lng: parseFloat(lng) }),
      },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error updating device:", error);
    return NextResponse.json(
      { error: "Failed to update device" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = parseInt(params.id);

    if (isNaN(deviceId)) {
      return NextResponse.json(
        { error: "Invalid device ID" },
        { status: 400 }
      );
    }

    await db.device.delete({
      where: { id: deviceId },
    });

    return NextResponse.json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("Error deleting device:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 }
    );
  }
}
