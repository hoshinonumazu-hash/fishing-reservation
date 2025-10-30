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
      email: 'hoshinonumazu@gmail.com',
      phoneNumber: '090-9999-8888',
      password: await bcrypt.hash('QJDSXr6OY=', 10),
      name: 'サイト管理者',
      role: UserRole.ADMIN,
    },
  });

  console.log(`✅ Created ${5} users`);

  // 船舶作成（ダミーデータ：星野丸 1隻）
  console.log('🚢 Creating boats...');

  const hoshinoMaru = await prisma.boat.create({
    data: {
      name: '星野丸',
      description: '駿河湾・相乗り可能。ビギナー歓迎。',
      location: '沼津港',
      capacity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?q=80&w=1600&auto=format&fit=crop',
      memo: '安全第一で出船します。',
      recentFish: 'タイ・アジ・イナダ',
      ownerId: boatOwner1.id,
      allowMultipleBookings: true,
    },
  });
  console.log(`✅ Created 1 boat: ${hoshinoMaru.name}`);

  // プランテンプレート（タイ釣り）
  const taiTemplate = await prisma.planTemplate.create({
    data: {
      name: 'タイ釣り',
      description: '初心者OK。タイラバ・テンヤ可。',
      fishType: 'タイ',
      price: 12000,
      departureTime: '06:00',
      returnTime: '12:00',
      maxPeople: 8,
      boatId: hoshinoMaru.id,
    },
  });

  // 釣りプラン作成（本日から30日分：毎日）
  console.log('🎣 Creating fishing plans (毎日/30日分)...');

  const today = new Date();
  const createdPlans = [] as string[];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    d.setDate(today.getDate() + i);
    const plan = await prisma.fishingPlan.create({
      data: {
        title: 'タイ釣り',
        description: '星野丸のタイ釣りプラン（毎日出船予定）',
        fishType: 'タイ',
        price: 12000,
        duration: 360, // 6時間
        maxPeople: 8,
        date: d,
        boatId: hoshinoMaru.id,
        templateId: taiTemplate.id,
      },
    });
    createdPlans.push(plan.id);
  }
  console.log(`✅ Created ${createdPlans.length} fishing plans for ${hoshinoMaru.name}`);

  // サンプル予約は今回は作らない
  console.log('📅 Creating sample bookings... (skip)');
  console.log(`✅ Created 0 sample bookings`);

  console.log('');
  console.log('✨ Seeding completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: 5 (2 customers, 2 boat owners, 1 admin)`);
  console.log(`   - Boats: 1 (星野丸)`);
  console.log(`   - Fishing Plans: ${30} (星野丸 タイ釣り・30日分)`);
  console.log(`   - Bookings: 0`);
  console.log('');
  console.log('🔐 Test Accounts:');
  console.log('   Customer: customer@example.com / password123');
  console.log('   Boat Owner: owner1@example.com / password123');
  console.log('   Admin: hoshinonumazu@gmail.com / QJDSXr6OY=');
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
