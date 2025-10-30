"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Boat } from '../../types';

// ひらがな・カタカナ・ローマ字・大文字小文字を区別せず正規化
function normalize(str: string): string {
  if (!str) return '';
  // 全角→半角、カタカナ→ひらがな、ローマ字小文字化
  return str
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[ァ-ン]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60)) // カタカナ→ひらがな
    .normalize('NFKC');
}

export default function BoatsListPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/boats')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBoats(data);
        } else {
          setBoats([]);
        }
      })
      .catch(() => setBoats([]));
  }, []);

  // 柔軟な検索（船名・エリア）
  const filteredBoats = boats.filter((boat) => {
    if (!query) return true;
    const q = normalize(query);
    return (
  normalize(boat.name).includes(q) ||
  normalize((boat as any).location ?? '').includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1D3557] mb-2">
            <i className="fas fa-ship mr-3 text-[#457B9D]"></i>
            釣り船一覧
          </h1>
          <p className="text-gray-600">お好みの船を見つけて、釣りを楽しもう！</p>
        </div>
        {/* 検索フィルター（モバイルではみ出さないよう調整） */}
        <div className="info-card !p-4 sm:!p-6 mb-8">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full">
            <i className="fas fa-search text-xl sm:text-2xl text-[#457B9D]"></i>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="船名・エリアで検索（例: かるもあ、東京湾、沼津）"
              className="form-input w-full sm:flex-1 min-w-0 !mb-0"
            />
          </div>
          {query && (
            <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
              <i className="fas fa-info-circle text-[#457B9D]"></i>
              <span>「{query}」で検索中... {filteredBoats.length}件の結果</span>
            </p>
          )}
        </div>
        {/* 船舶一覧 */}
        {filteredBoats.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">該当する船がありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <ul className="divide-y">
              {filteredBoats.map((boat) => (
                <li key={boat.id}>
                  <Link
                    href={`/boats/${boat.id}`}
                    className="block p-4 hover:bg-gray-50 transition"
                  >
                    <div className="font-bold text-lg text-[#1D3557]">
                      {typeof boat.name === 'string' ? boat.name.replace(/^\s*🚢\s*/, '').trim() : boat.name}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {(boat as any).location || '未設定'}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
