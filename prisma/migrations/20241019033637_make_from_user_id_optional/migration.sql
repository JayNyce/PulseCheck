-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_fromUserId_fkey";

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "fromUserId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_toUserId_idx" ON "Feedback"("toUserId");

-- CreateIndex
CREATE INDEX "Feedback_fromUserId_idx" ON "Feedback"("fromUserId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
