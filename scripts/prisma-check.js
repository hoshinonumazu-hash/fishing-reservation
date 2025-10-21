const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient({ log: ['error'] });
  try {
    await prisma.$connect();
    console.log('[OK] Connected to DB');
    const now = await prisma.$queryRawUnsafe('SELECT NOW() as now');
    console.log('[OK] NOW()', now?.[0]?.now ?? null);
    const userCount = await prisma.user.count();
    const boatCount = await prisma.boat.count();
    console.log(`[OK] users=${userCount} boats=${boatCount}`);
  } catch (e) {
    console.error('[ERR]', e?.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();