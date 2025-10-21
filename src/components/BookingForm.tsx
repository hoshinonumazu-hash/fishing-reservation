'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  planId: string;
  planTitle: string;
  planPrice: number;
  maxPeople: number;
  boatName: string;
  planDate: string | Date; // プランの実施日
}

export default function BookingForm({ planId, planTitle, planPrice, maxPeople, boatName, planDate }: BookingFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    participants: 1,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'participants' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          date: planDate, // プランの日付を使用
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '予約に失敗しました');
      }

      // 予約成功後、予約詳細ページにリダイレクト
      router.push(`/bookings/${data.booking.id}?success=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = planPrice * formData.participants;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">予約フォーム</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-lg mb-2">{planTitle}</h3>
        <p className="text-gray-700">船名: {boatName}</p>
        <p className="text-gray-700">実施日: 📅 {new Date(planDate).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        })}</p>
        <p className="text-gray-700">料金: ¥{planPrice.toLocaleString()} / 人</p>
        <p className="text-gray-700">定員: 最大 {maxPeople} 名</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="090-1234-5678"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
            参加人数 <span className="text-red-500">*</span>
          </label>
          <select
            id="participants"
            name="participants"
            required
            value={formData.participants}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: maxPeople }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                {num} 名
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            備考・要望
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ご要望やご質問があればご記入ください"
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">合計金額:</span>
            <span className="text-2xl font-bold text-blue-600">
              ¥{totalPrice.toLocaleString()}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold transition-colors"
          >
            {isSubmitting ? '予約中...' : '予約を確定する'}
          </button>
        </div>
      </form>
    </div>
  );
}
