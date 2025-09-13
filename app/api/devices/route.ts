import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Device, Image } from "@prisma/client";

export async function GET() {
  const devices = await db.device.findMany({
    include: { images: true },
  });

  return NextResponse.json(
    devices.map((d: Device & { images: Image[] }) => ({
      id: d.id,
      title: d.title,
      lat: d.lat,
      lng: d.lng,
      description: d.description,
      images: d.images.map((img: Image) => `/uploads/${img.url}`),
    }))
  );
}
