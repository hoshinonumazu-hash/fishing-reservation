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
        {/* 検索フィルター */}
        <div className="info-card !p-6 mb-8">
          <div className="flex items-center gap-3">
            <i className="fas fa-search text-2xl text-[#457B9D]"></i>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="船名・エリアで検索（例: かるもあ、東京湾、沼津）"
              className="form-input flex-1 !mb-0"
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
          <div className="info-card !p-16 text-center">
            <i className="fas fa-ship text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-600">該当する船がありません</p>
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="quick-action-button !bg-[#A8DADC] !text-[#1D3557] hover:!bg-[#457B9D] hover:!text-white mt-4"
              >
                <i className="fas fa-redo mr-2"></i>
                検索をクリア
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoats.map((boat) => (
              <Link
                key={boat.id}
                href={`/boats/${boat.id}`}
                className="info-card !p-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer block overflow-hidden"
              >
                {/* 船の画像 */}
                {boat.imageUrl ? (
                  <div className="w-full h-48 bg-gray-200 overflow-hidden relative">
                    <img 
                      src={boat.imageUrl} 
                      alt={boat.name}
                      className="w-full h-full object-cover absolute top-0 left-0"
                      style={{ maxHeight: '192px', minHeight: '192px' }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-[#457B9D] to-[#1D3557] flex items-center justify-center">
                    <i className="fas fa-ship text-6xl text-white/50"></i>
                  </div>
                )}
                {/* 船情報 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1D3557] mb-2 flex items-center gap-2">
                    <i className="fas fa-ship text-[#457B9D]"></i>
                    {boat.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="fas fa-map-marker-alt text-[#457B9D] w-5"></i>
                    <span>{(boat as any).location || '未設定'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
