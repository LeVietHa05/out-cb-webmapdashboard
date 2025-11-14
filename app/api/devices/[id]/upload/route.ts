import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!file)
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(process.cwd(), "public/uploads", filename);

  await writeFile(filepath, buffer);

  // Lưu vào DB
  await db.image.create({    
    data: {
      url: filename,
      title,
      content,
      deviceId: Number(id),
    },
  });

  // Update device's lastUploadAt timestamp
  await db.device.update({
    where: { id: Number(id) },
    data: { lastUploadAt: new Date() },
  });

  return NextResponse.json({ success: true, filename, title, content });
}
