"use client";

export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { FishingPlan } from '../../types';

function ReserveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('planId');
  const [plan, setPlan] = useState<FishingPlan | null>(null);
  
  // フォームの状態管理
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [participants, setParticipants] = useState(1);
  const [message, setMessage] = useState('');
  
  // UI状態管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ログイン情報の読み込み
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhone = localStorage.getItem('userPhone');
    
    if (userName) {
      setName(userName);
      setIsLoggedIn(true);
    }
    if (userEmail) {
      setEmail(userEmail);
    }
    if (userPhone) {
      setPhone(userPhone);
    }
  }, []);

  useEffect(() => {
    if (planId) {
      fetch(`/api/plans?planId=${planId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const foundPlan = data.find((p: any) => String(p.id) === String(planId));
            setPlan(foundPlan || null);
          } else if (data && String(data.id) === String(planId)) {
            setPlan(data);
          }
        })
        .catch((error) => {
          console.error('プラン取得エラー:', error);
        });
    }
  }, [planId]);

  // バリデーション
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'お名前を入力してください';
    }
    
    if (!phone.trim()) {
      newErrors.phone = '電話番号を入力してください';
    } else if (!/^[0-9-]+$/.test(phone)) {
      newErrors.phone = '電話番号は数字とハイフンのみで入力してください';
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }
    
    if (participants < 1) {
      newErrors.participants = '参加人数は1名以上を指定してください';
    } else if (plan && participants > plan.maxCapacity) {
      newErrors.participants = `定員は${plan.maxCapacity}名までです`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestData = {
        planId: planId, // 文字列のまま送信
        name,
        phone,
        email: email || undefined,
        participants,
        date: plan?.date, // プランの日付を使用
        message: message || undefined,
      };
      
      console.log('予約リクエスト送信:', requestData);
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('レスポンスステータス:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('予約成功:', data);
        // 予約詳細ページへ遷移
        router.push(`/bookings/${data.booking.id}?success=true`);
      } else {
        const errorData = await response.json();
        console.error('予約失敗:', errorData);
        alert('予約に失敗しました: ' + (errorData.message || '不明なエラー'));
      }
    } catch (error) {
      console.error('予約エラー:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      alert('予約処理中にエラーが発生しました\n詳細: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!planId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">プランIDが指定されていません</p>
        </div>
      </div>
    );
  }
  
  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">プラン情報を取得中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* プラン情報カード */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">予約内容</h1>
          <div className="border-l-4 border-blue-500 pl-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800">{plan.title}</h2>
            <p className="text-gray-600 mt-2">{plan.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2 bg-blue-100 p-3 rounded-lg">
              <span className="text-gray-700 font-medium">📅 実施日:</span>
              <span className="ml-2 font-bold text-lg text-blue-800">
                {plan.date ? (
                  new Date(plan.date).toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'short'
                  })
                ) : (
                  '日付未設定'
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-500">料金:</span>
              <span className="ml-2 font-bold text-lg text-blue-600">¥{plan.price.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">定員:</span>
              <span className="ml-2 font-semibold">{plan.maxCapacity}名</span>
            </div>
            <div>
              <span className="text-gray-500">出船:</span>
              <span className="ml-2">{plan.departureTime}</span>
            </div>
            <div>
              <span className="text-gray-500">帰港:</span>
              <span className="ml-2">{plan.returnTime}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">集合場所:</span>
              <span className="ml-2">{plan.meetingPlace}</span>
            </div>
          </div>
        </div>

        {/* 予約フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">予約者情報</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 氏名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                氏名 <span className="text-red-500">*</span>
                {isLoggedIn && <span className="ml-2 text-xs text-green-600">(自動入力)</span>}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } ${isLoggedIn ? 'bg-green-50' : ''}`}
                placeholder="山田 太郎"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* 電話番号 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                電話番号 <span className="text-red-500">*</span>
                {isLoggedIn && phone && <span className="ml-2 text-xs text-green-600">(自動入力)</span>}
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } ${isLoggedIn && phone ? 'bg-green-50' : ''}`}
                placeholder="090-1234-5678"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-gray-400 text-xs">(任意)</span>
                {isLoggedIn && email && <span className="ml-2 text-xs text-green-600">(自動入力)</span>}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } ${isLoggedIn && email ? 'bg-green-50' : ''}`}
                placeholder="example@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* 実施日（表示のみ） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                実施日
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                📅 {plan?.date ? new Date(plan.date).toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short'
                }) : '-'}
              </div>
              <p className="mt-1 text-sm text-gray-500">※この日程でのご予約となります</p>
            </div>

            {/* 参加人数 */}
            <div>
              <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">
                参加人数 <span className="text-red-500">*</span>
              </label>
              <select
                id="participants"
                value={participants}
                onChange={(e) => setParticipants(Number(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.participants ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {Array.from({ length: plan!.maxCapacity }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}名
                  </option>
                ))}
              </select>
              {errors.participants && <p className="mt-1 text-sm text-red-500">{errors.participants}</p>}
            </div>

            {/* 備考・要望 */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                備考・ご要望 <span className="text-gray-400 text-xs">(任意)</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="アレルギーや特別なご要望がありましたらご記入ください"
              />
            </div>

            {/* 合計金額表示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">合計金額:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {`¥${(plan!.price * participants).toLocaleString()}`}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {`${plan!.price.toLocaleString()}円 × ${participants}名`}
              </p>
            </div>

            {/* ボタン */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 rounded-lg text-white font-bold transition ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? '予約中...' : '予約を確定する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ReservePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <ReserveContent />
    </Suspense>
  );
}
