import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();
    if (!email || !password || !name || !phone) {
      return new Response(JSON.stringify({ message: '全ての項目を入力してください。' }), { status: 400 });
    }
    // メールアドレス重複チェック
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ message: 'このメールアドレスは既に登録されています。' }), { status: 409 });
    }
    // パスワードハッシュ化
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
  phoneNumber: phone,
  role: UserRole.CUSTOMER
    });
    return new Response(JSON.stringify({ message: '登録成功', user: { id: user.id, email: user.email, name: user.name } }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'サーバーエラー', error: String(e) }), { status: 500 });
  }
}
