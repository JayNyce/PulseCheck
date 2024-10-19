-- AlterTable (temporary nullable topicId)
ALTER TABLE "Feedback" DROP COLUMN "topic",
ADD COLUMN "topicId" INTEGER NULL;

-- CreateTable (topics table)
CREATE TABLE "topics" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (topics name index)
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");

-- CreateIndex (Feedback topicId index)
CREATE INDEX "Feedback_topicId_idx" ON "Feedback"("topicId");

-- AddForeignKey (constraint for topicId foreign key)
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
