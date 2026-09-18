-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "syncRequired" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "device_heartbeats" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "deviceId" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appVersion" TEXT,
    "locale" TEXT,

    CONSTRAINT "device_heartbeats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "device_heartbeats_tenantId_lastSeen_idx" ON "device_heartbeats"("tenantId", "lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "device_heartbeats_tenantId_deviceId_key" ON "device_heartbeats"("tenantId", "deviceId");

-- AddForeignKey
ALTER TABLE "device_heartbeats" ADD CONSTRAINT "device_heartbeats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
