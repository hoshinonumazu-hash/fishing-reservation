"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBoatPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState<number>(6);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [recentFish, setRecentFish] = useState("");
  const [allowMultipleBookings, setAllowMultipleBookings] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setError("オーナーログインが必要です");
      return;
    }

    if (!name || !location || !capacity) {
      setError("必須項目を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/owner/boats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, location, capacity: Number(capacity), description, imageUrl, memo, recentFish, allowMultipleBookings })
      });
      if (!res.ok) {
        // レスポンス本文の詳細を取得（JSON/Textの両対応）
        let bodyText = '';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await res.json();
            bodyText = typeof data === 'string' ? data : JSON.stringify(data);
          } else {
            bodyText = await res.text();
          }
        } catch {
          // 本文の読み取りに失敗しても無視
        }
        throw new Error(`エラー (${res.status}) ${bodyText ? `- ${bodyText}` : ''}`.trim());
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/owner/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || '保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">船舶を追加</h1>
            <p className="text-gray-600">新しい船舶を登録します</p>
          </div>
          <Link href="/owner/boats" className="boat-link hover:underline">
            <i className="fas fa-arrow-left mr-2"></i>
            船舶一覧へ
          </Link>
        </div>
      </div>

      <div className="info-card">
        <div className="flex items-center mb-6">
          <div className="boat-icon !text-3xl mr-3">
            <i className="fas fa-ship"></i>
          </div>
          <h2 className="text-2xl font-bold">船舶情報</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <i className="fas fa-ship mr-2"></i>
                船名 *
              </label>
              <input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="例: といとい丸" required />
            </div>
            <div>
              <label className="form-label">
                <i className="fas fa-map-marker-alt mr-2"></i>
                所在地 *
              </label>
              <input className="form-input" value={location} onChange={e=>setLocation(e.target.value)} placeholder="例: 戸田漁港" required />
            </div>
          </div>
          <div>
            <label className="form-label">
              <i className="fas fa-users mr-2"></i>
              定員 *
            </label>
            <input type="number" min={1} className="form-input" value={capacity} onChange={e=>setCapacity(Number(e.target.value))} required />
          </div>
          <div>
            <label className="form-label">
              <i className="fas fa-align-left mr-2"></i>
              紹介文
            </label>
            <textarea className="form-textarea" value={description} onChange={e=>setDescription(e.target.value)} rows={4} placeholder="船の特徴や魅力を記入してください" />
          </div>
          <div>
            <label className="form-label">
              <i className="fas fa-image mr-2"></i>
              画像URL
            </label>
            <input className="form-input" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://..." />
            {imageUrl && (
              <div className="mt-3">
                <img src={imageUrl} alt="プレビュー" className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200" />
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <i className="fas fa-sticky-note mr-2"></i>
                一言メモ
              </label>
              <input className="form-input" value={memo} onChange={e=>setMemo(e.target.value)} placeholder="例: 今週はイナダ好調！" />
            </div>
            <div>
              <label className="form-label">
                <i className="fas fa-fish mr-2"></i>
                最近釣れている魚種
              </label>
              <input className="form-input" value={recentFish} onChange={e=>setRecentFish(e.target.value)} placeholder="例: イナダ, タチウオ" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowMultipleBookings}
                onChange={(e) => setAllowMultipleBookings(e.target.checked)}
                className="mt-1 w-6 h-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="block font-semibold text-gray-800 mb-1">
                  <i className="fas fa-user-friends mr-2"></i>
                  同じ日に複数グループの予約を許可する（相乗りOK）
                </span>
                <p className="text-sm text-gray-600">
                  チェックを外すと、1日1組限定（貸切のみ）になります
                </p>
              </div>
            </label>
          </div>
          <div className="flex gap-4 items-center pt-4 border-t-2 border-gray-200">
            <button type="submit" disabled={isSubmitting} className="quick-action-button !px-8 !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              <i className="fas fa-save !text-xl !mb-0 mr-2"></i>
              {isSubmitting ? '保存中...' : '船舶を追加'}
            </button>
            {error && (
              <span className="text-red-600 font-medium flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </span>
            )}
            {success && (
              <span className="text-green-600 font-medium flex items-center">
                <i className="fas fa-check-circle mr-2"></i>
                保存しました！リダイレクト中...
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
