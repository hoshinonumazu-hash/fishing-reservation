-- AlterTable
ALTER TABLE "boats" ADD COLUMN     "memo" TEXT,
ADD COLUMN     "recentFish" TEXT;

-- AlterTable
ALTER TABLE "fishing_plans" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "plan_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fishType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "departureTime" TEXT NOT NULL,
    "returnTime" TEXT NOT NULL,
    "maxPeople" INTEGER NOT NULL,
    "boatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "plan_templates" ADD CONSTRAINT "plan_templates_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fishing_plans" ADD CONSTRAINT "fishing_plans_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "plan_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
