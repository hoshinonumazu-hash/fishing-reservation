import { NextRequest } from 'next/server';
import type { Boat } from '../../../types';

// 仮のダミーデータ
let boats: Boat[] = [
  {
    id: 1,
    name: 'カルモア',
    ownerName: 'カルモアさん',
    contact: '090-xxxx-xxxx',
    homepageUrl: 'https://karumoa.example.com',
  },
  {
    id: 2,
    name: 'マリンブルー',
    ownerName: 'マリンさん',
    contact: '080-xxxx-xxxx',
    homepageUrl: 'https://marineblue.example.com',
  },
];

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify(boats), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
