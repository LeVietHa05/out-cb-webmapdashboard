/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.environmentData.deleteMany();
  await prisma.image.deleteMany();
  await prisma.device.deleteMany();

  // TODO: change to another place in caobang 
  const device1 = await prisma.device.create({
    data: {
      title: "Camera Hồ Gươm",
      description: "Thiết bị quan sát tại Hồ Gươm, Hà Nội",
      lat: 21.0285,
      lng: 105.8542,
      isFogging: false,
      isRoadSlippery: false,
      isLandslide: false,
      images: {
        create: [
          { url: "https://placekitten.com/200/200", licensePlate: "29A-12345" },
          { url: "https://placekitten.com/300/200", licensePlate: "30B-67890" },
        ],
      },
      envirs: {
        create: [
          { temperature: 25.5, humidity: 70.0, isRaining: false },
          { temperature: 24.0, humidity: 75.5, isRaining: false },
        ],
      },
    },
  });

  const device2 = await prisma.device.create({
    data: {
      title: "Camera Lăng Bác",
      description: "Thiết bị quan sát tại Quảng trường Ba Đình",
      lat: 21.0379,
      lng: 105.8331,
      isFogging: true,
      isRoadSlippery: false,
      isLandslide: false,
      images: {
        create: [{ url: "https://placekitten.com/250/200" }],
      },
      envirs: {
        create: [
          { temperature: 18.0, humidity: 96.0, isRaining: false },
          { temperature: 19.5, humidity: 95.5, isRaining: false },
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
