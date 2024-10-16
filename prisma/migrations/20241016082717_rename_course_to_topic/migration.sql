/*
  Warnings:

  - You are about to drop the column `course_name` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `topic` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "course_name",
ADD COLUMN     "topic" TEXT NOT NULL;
