import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone, role, boatName } = await req.json();
    if (!email || !password || !name || !phone || !role || (role === "BOAT_OWNER" && !boatName)) {
      return new Response(JSON.stringify({ message: '全ての項目を入力してください。' }), { status: 400 });
    }
    if (!["CUSTOMER", "BOAT_OWNER"].includes(role)) {
      return new Response(JSON.stringify({ message: '不正なユーザー種別です。' }), { status: 400 });
    }
    // メールアドレス重複チェック
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ message: 'このメールアドレスは既に登録されています。' }), { status: 409 });
    }
    // 電話番号重複チェック
    const existingPhone = await prisma.user.findUnique({ where: { phoneNumber: phone } });
    if (existingPhone) {
      return new Response(JSON.stringify({ message: 'この電話番号は既に登録されています。' }), { status: 409 });
    }
    // パスワードハッシュ化
    const hashed = await bcrypt.hash(password, 10);
    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phoneNumber: phone,
        role,
        approvalStatus: role === "BOAT_OWNER" ? "PENDING" : "APPROVED",
      },
    });
    let boat = null;
    if (role === "BOAT_OWNER") {
      // オーナー用の釣り船を作成
      boat = await prisma.boat.create({
        data: {
          name: boatName,
          ownerId: user.id,
          location: "未設定",
          capacity: 10,
        },
      });
    }
    return new Response(JSON.stringify({ message: '登録成功', user: { id: user.id, email: user.email, name: user.name, role: user.role }, boat }), { status: 201 });
  } catch (e: any) {
    // Prismaのユニーク制約エラーを明示的に返す
    if (e.code === 'P2002') {
      return new Response(JSON.stringify({ message: '既に登録されている情報があります。', error: e.meta }), { status: 409 });
    }
    return new Response(JSON.stringify({ message: 'サーバーエラー', error: String(e) }), { status: 500 });
  }
}
