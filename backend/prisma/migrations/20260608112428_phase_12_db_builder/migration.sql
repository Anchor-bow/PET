-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Record_appId_tableId_idx" ON "Record"("appId", "tableId");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
