import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'メールアドレスとパスワードを入力してください。' }), { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ message: 'メールアドレスまたはパスワードが違います。' }), { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return new Response(JSON.stringify({ message: 'メールアドレスまたはパスワードが違います。' }), { status: 401 });
    }
    // JWT発行（本番はHttpOnly Cookie推奨）
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return new Response(JSON.stringify({ 
    message: 'ログイン成功', 
    token, 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      phone: user.phoneNumber,
      role: user.role 
    } 
  }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'サーバーエラー', error: String(e) }), { status: 500 });
  }
}
