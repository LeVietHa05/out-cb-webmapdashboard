/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.environmentData.deleteMany();
  await prisma.image.deleteMany();
  await prisma.device.deleteMany();

  const specificTime1 = new Date("2025-11-15T08:30:00.000Z");
  const specificTime2 = new Date("2024-11-14T09:45:00.000Z");
  const specificTime3 = new Date("2024-11-16T10:15:00.000Z");

  // TODO: change to another place in caobang 
  const device1 = await prisma.device.create({
    data: {
      title: "Camera QL 34 - 1",
      description: "Thiết bị trên đường đi tới Nguyên Bình",
      lat: 22.65263,
      lng: 105.9331,
      isFogging: false,
      isRoadSlippery: false,
      isLandslide: false,
      lastUploadAt: specificTime1, // Thời gian cụ thể cho device
      images: {
        create: [
          {
            url: "1766949513082-cam2_frame.jpg", licensePlate: "", createdAt: specificTime1 // Thời gian cụ thể cho image
          },
          {
            url: "1766949512766-cam1_frame.jpg", licensePlate: "", createdAt: specificTime2 // Thời gian cụ thể cho image
          },
        ],
      },
      envirs: {
        create: [
          { temperature: 25.5, humidity: 70.0, isRaining: false, createdAt: specificTime1 },
          { temperature: 24.0, humidity: 75.5, isRaining: false, createdAt: specificTime2 },
        ],
      },
    },
  });

  const device2 = await prisma.device.create({
    data: {
      title: "Camera đèo Mã Phục",
      description: "P8JP+2WQ Trà Lĩnh, Cao Bằng, Việt Nam",
      lat: 22.7301,
      lng: 106.3373,
      isFogging: true,
      isRoadSlippery: false,
      isLandslide: false,
      lastUploadAt: specificTime3,
      images: {
        create: [{ url: "https://placekitten.com/250/200", createdAt: specificTime3, }],
      },
      envirs: {
        create: [
          { temperature: 18.0, humidity: 96.0, isRaining: false, createdAt: specificTime3, },
          { temperature: 19.5, humidity: 95.5, isRaining: false, createdAt: specificTime3, },
        ],
      },
    },
  });

  console.log({ device1, device2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
