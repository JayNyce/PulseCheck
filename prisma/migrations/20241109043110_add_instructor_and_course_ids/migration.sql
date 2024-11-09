/*
  Warnings:

  - A unique constraint covering the columns `[name,courseId]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Topic_name_key";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "instructorId" INTEGER;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "courseId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isInstructor" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_courseId_key" ON "Topic"("name", "courseId");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
