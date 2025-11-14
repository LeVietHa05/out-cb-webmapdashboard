import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { temperature, humidity, isRaining, isLandslide } = body;

    // Validate required fields
    if (temperature === undefined || humidity === undefined || isRaining === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: temperature, humidity, isRaining" },
        { status: 400 }
      );
    }

    // Create environment data record
    const envData = await db.environmentData.create({
      data: {
        temperature: Number(temperature),
        humidity: Number(humidity),
        isRaining: Boolean(isRaining),
        deviceId: Number(id),
      },
    });

    // Calculate isFogging: humidity > 95% AND temperature < 20°C
    const isFogging = humidity > 95 && temperature < 20;

    // Calculate isRoadSlippery: check if it's been raining for more than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRainData = await db.environmentData.findMany({
      where: {
        deviceId: Number(id),
        createdAt: { gte: tenMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check if all recent readings show rain
    const isRoadSlippery = recentRainData.length > 0 && 
                           recentRainData.every(data => data.isRaining);

    // Update device status
    const updateData: {
      isFogging: boolean;
      isRoadSlippery: boolean;
      isLandslide?: boolean ;
    } = {
      isFogging,
      isRoadSlippery,
    };

    // Only update isLandslide if explicitly provided
    if (isLandslide !== undefined) {
      updateData.isLandslide = Boolean(isLandslide);
    } else {
      updateData.isLandslide = false;
    }

    await db.device.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      environmentData: envData,
      deviceStatus: {
        isFogging,
        isRoadSlippery,
        isLandslide: isLandslide !== undefined ? Boolean(isLandslide) : false,
      },
    });
  } catch (error) {
    console.error("Error processing environment data:", error);
    return NextResponse.json(
      { error: "Failed to process environment data" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve environment history for a device
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const envData = await db.environmentData.findMany({
      where: { deviceId: Number(id) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      deviceId: Number(id),
      count: envData.length,
      data: envData,
    });
  } catch (error) {
    console.error("Error fetching environment data:", error);
    return NextResponse.json(
      { error: "Failed to fetch environment data" },
      { status: 500 }
    );
  }
}
