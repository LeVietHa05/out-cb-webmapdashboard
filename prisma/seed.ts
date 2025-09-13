/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.image.deleteMany();
  await prisma.device.deleteMany();

  const device1 = await prisma.device.create({
    data: {
      title: "Camera Hồ Gươm",
      description: "Thiết bị quan sát tại Hồ Gươm, Hà Nội",
      lat: 21.0285,
      lng: 105.8542,
      images: {
        create: [
          { url: "https://placekitten.com/200/200" },
          { url: "https://placekitten.com/300/200" },
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
      images: {
        create: [{ url: "https://placekitten.com/250/200" }],
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
