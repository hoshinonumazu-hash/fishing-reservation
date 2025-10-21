'use client';

import { useForm, SubmitHandler, FieldError, UseFormRegisterReturn } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

type FormFieldProps = {
  label: string;
  error?: FieldError;
  children: ReactNode;
};

const FormField = ({ label, error, children }: FormFieldProps) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    {children}
    {error && <p className="text-red-600 text-xs mt-1">{error.message}</p>}
  </div>
);

type PlanFormData = {
  title: string;
  description: string;
  area: string;
  fishTypes: string;
  price: number;
  maxCapacity: number;
  departureTime: string;
  returnTime: string;
  meetingPlace: string;
  imageUrl?: string;
  weekday: string;
};

export default function AddPlan() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormData>();

  const onSubmit: SubmitHandler<PlanFormData> = async (data: PlanFormData) => {
    setError('');
    setSuccess(false);

    try {
      await axios.post('/api/plans', data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('プランの追加中にエラーが発生しました:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // サーバーからのレスポンスがある場合
          if (err.response.status === 400) {
            setError(err.response.data.message || '入力内容が正しくありません。');
          } else if (err.response.status === 500) {
            setError('サーバーでエラーが発生しました。時間をおいて再度お試しください。');
          } else {
            setError(`エラーが発生しました: ${err.response.data.message || err.response.status}`);
          }
        } else if (err.request) {
          // リクエストはしたがレスポンスがない場合 (ネットワークエラー)
          setError('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
        }
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">新規プラン追加</h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="タイトル" error={errors.title}>
            <input
              type="text"
              {...register('title', { required: 'タイトルは必須です。' })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 三浦半島 マダイ釣り半日コース"
            />
          </FormField>
          <FormField label="エリア" error={errors.area}>
            <input
              type="text"
              {...register('area', { required: 'エリアは必須です。' })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 三浦半島"
            />
          </FormField>
          <FormField label="料金" error={errors.price}>
            <input
              type="number"
              {...register('price', { required: '料金は必須です。', valueAsNumber: true, min: { value: 0, message: '0以上の数値を入力してください。' } })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 12000"
            />
          </FormField>
          <FormField label="対象魚種（カンマ区切り）" error={errors.fishTypes}>
            <input
              type="text"
              {...register('fishTypes', { required: '対象魚種は必須です。' })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: マダイ,イサキ,アジ"
            />
          </FormField>
          <FormField label="説明" error={errors.description}>
            <textarea
              {...register('description', { required: '説明は必須です。' })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={4}
              placeholder="プランの詳細な説明を入力してください。"
            ></textarea>
          </FormField>
          <FormField label="曜日" error={errors.weekday}>
            <select
              {...register('weekday', { required: '曜日は必須です。' })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">選択してください</option>
              <option value="月">月</option>
              <option value="火">火</option>
              <option value="水">水</option>
              <option value="木">木</option>
              <option value="金">金</option>
              <option value="土">土</option>
              <option value="日">日</option>
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="最大定員" error={errors.maxCapacity}>
              <input
                type="number"
                {...register('maxCapacity', { required: '最大定員は必須です。', valueAsNumber: true, min: { value: 1, message: '1以上の数値を入力してください。' } })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="例: 10"
              />
            </FormField>
            <FormField label="画像URL" error={errors.imageUrl}>
              <input
                type="url"
                {...register('imageUrl')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://example.com/image.jpg"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="出港時刻" error={errors.departureTime}>
              <input
                type="time"
                {...register('departureTime', { required: '出港時刻は必須です。' })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormField>
            <FormField label="帰港時刻" error={errors.returnTime}>
              <input
                type="time"
                {...register('returnTime', { required: '帰港時刻は必須です。' })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </FormField>
          </div>
          <FormField label="集合場所" error={errors.meetingPlace}>
            <input
              type="text"
              {...register('meetingPlace', { required: '集合場所は必須です。' })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 〇〇漁港"
            />
          </FormField>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? '追加中...' : 'プランを追加'}
          </button>
          {success && <p className="text-green-600 text-center">プランが正常に追加されました。</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}
          <div className="text-center mt-4">
            <Link href="/" className="text-blue-600 hover:underline">
              戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
