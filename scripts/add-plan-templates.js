const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('[INFO] Creating plan_templates table...');
  
  // plan_templatesテーブル作成
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS plan_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      "fishType" TEXT NOT NULL,
      price INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      "maxPeople" INTEGER NOT NULL,
      "boatId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "plan_templates_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES boats(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `;
  
  console.log('[OK] plan_templates table created');
  
  // fishing_plansテーブルにtemplateIdカラム追加
  console.log('[INFO] Adding templateId column to fishing_plans...');
  
  await prisma.$executeRaw`
    ALTER TABLE fishing_plans 
    ADD COLUMN IF NOT EXISTS "templateId" TEXT
  `;
  
  await prisma.$executeRaw`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fishing_plans_templateId_fkey'
      ) THEN
        ALTER TABLE fishing_plans 
        ADD CONSTRAINT "fishing_plans_templateId_fkey" 
        FOREIGN KEY ("templateId") REFERENCES plan_templates(id) 
        ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END
    $$
  `;
  
  console.log('[OK] templateId column added to fishing_plans');
  console.log('[SUCCESS] All migrations completed');
}

main()
  .catch((e) => {
    console.error('[ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
