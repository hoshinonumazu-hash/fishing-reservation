import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 既存データの削除（開発環境のみ）
  console.log('🗑️  Cleaning up existing data...');
  await prisma.booking.deleteMany();
  await prisma.fishingPlan.deleteMany();
  await prisma.boat.deleteMany();
  await prisma.user.deleteMany();

  // ユーザー作成
  console.log('👤 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      phoneNumber: '090-1234-5678',
      password: hashedPassword,
      name: '山田太郎',
      role: UserRole.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@example.com',
      phoneNumber: '090-8765-4321',
      password: hashedPassword,
      name: '佐藤花子',
      role: UserRole.CUSTOMER,
    },
  });

  const boatOwner1 = await prisma.user.create({
    data: {
      email: 'owner1@example.com',
      phoneNumber: '080-1111-2222',
      password: hashedPassword,
      name: '船長 一郎',
      role: UserRole.BOAT_OWNER,
    },
  });

  const boatOwner2 = await prisma.user.create({
    data: {
      email: 'owner2@example.com',
      phoneNumber: '080-3333-4444',
      password: hashedPassword,
      name: '漁師 二郎',
      role: UserRole.BOAT_OWNER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      phoneNumber: '090-9999-8888',
      password: hashedPassword,
      name: '管理者',
      role: UserRole.ADMIN,
    },
  });

  console.log(`✅ Created ${5} users`);

  // 船舶作成（ダミーデータは削除、実際のデータのみ）
  console.log('🚢 Creating boats...');

  // ダミーデータを削除したため、船舶は0件
  console.log(`✅ Created ${0} boats`);

  // 釣りプラン作成（ダミーデータは削除）
  console.log('🎣 Creating fishing plans...');

  // ダミーデータを削除したため、プランは0件
  console.log(`✅ Created ${0} fishing plans`);

  // サンプル予約作成（ダミーデータは削除）
  console.log('📅 Creating sample bookings...');

  // ダミーデータを削除したため、予約は0件
  console.log(`✅ Created ${0} sample bookings`);

  console.log('');
  console.log('✨ Seeding completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: 5 (2 customers, 2 boat owners, 1 admin)`);
  console.log(`   - Boats: 0 (ダミーデータ削除済み)`);
  console.log(`   - Fishing Plans: 0 (ダミーデータ削除済み)`);
  console.log(`   - Bookings: 0 (ダミーデータ削除済み)`);
  console.log('');
  console.log('🔐 Test Accounts:');
  console.log('   Customer: customer@example.com / password123');
  console.log('   Boat Owner: owner1@example.com / password123');
  console.log('   Admin: admin@example.com / password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
