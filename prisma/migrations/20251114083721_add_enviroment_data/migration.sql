-- AlterTable
ALTER TABLE "Image" ADD COLUMN "licensePlate" TEXT;

-- CreateTable
CREATE TABLE "EnvironmentData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "temperature" REAL NOT NULL,
    "humidity" REAL NOT NULL,
    "isRaining" BOOLEAN NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnvironmentData_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "isFogging" BOOLEAN NOT NULL DEFAULT false,
    "isRoadSlippery" BOOLEAN NOT NULL DEFAULT false,
    "isLandslide" BOOLEAN NOT NULL DEFAULT false,
    "lastUploadAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Device" ("createdAt", "description", "id", "lastUploadAt", "lat", "lng", "title", "updatedAt") SELECT "createdAt", "description", "id", "lastUploadAt", "lat", "lng", "title", "updatedAt" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
