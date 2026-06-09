-- CreateTable
CREATE TABLE "RelationRecord" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "sourceTableId" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "targetTableId" TEXT NOT NULL,
    "targetRecordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RelationRecord_appId_sourceTableId_sourceRecordId_idx" ON "RelationRecord"("appId", "sourceTableId", "sourceRecordId");

-- CreateIndex
CREATE INDEX "RelationRecord_appId_targetTableId_targetRecordId_idx" ON "RelationRecord"("appId", "targetTableId", "targetRecordId");

-- AddForeignKey
ALTER TABLE "RelationRecord" ADD CONSTRAINT "RelationRecord_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
