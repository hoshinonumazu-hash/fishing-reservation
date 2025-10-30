'use client';

import { useForm, SubmitHandler, FieldError } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

type FormFieldProps = {
  label: string;
  error?: FieldError;
  children: ReactNode;
};

const FormField = ({ label, error, children }: FormFieldProps) => (
  <div>
    <label className="form-label">{label}</label>
    {children}
    {error && (
      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
        <i className="fas fa-exclamation-circle"></i>
        {error.message}
      </p>
    )}
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
  boatId: string;
};

interface PlanTemplate {
  id: string;
  name: string;
  description?: string;
  fishType: string;
  price: number;
  departureTime: string;
  returnTime: string;
  maxPeople: number;
  boatId: string;
  boat: {
    id: string;
    name: string;
  };
}

// 祝日リスト（2025年10月・11月分のみ例示）
const holidays = [
  '2025-10-13', // 体育の日
  '2025-11-03', // 文化の日
  '2025-11-23', // 勤労感謝の日
];

function isHoliday(dateStr: string) {
  return holidays.includes(dateStr);
}

const monthTabs = [
  { year: 2025, month: 9, label: '10月' },
  { year: 2025, month: 10, label: '11月' },
  { year: 2025, month: 11, label: '12月' },
  { year: 2026, month: 0, label: '1月' },
];

export default function AddPlan() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [boats, setBoats] = useState<Array<{ id: string; name: string }>>([]);
  const [mode, setMode] = useState<'manual' | 'template'>('template'); // デフォルトはテンプレート
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  const [planDate, setPlanDate] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // 複数日選択用
  // カレンダーの月送り状態
  const [calendarYear, setCalendarYear] = useState(2025);
  const [calendarMonth, setCalendarMonth] = useState(9); // 0-indexed: 9=10月

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PlanFormData>();

  // オーナーの船とテンプレートを取得
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('ログインが必要です。');
      return;
    }

    // 船舶一覧取得
    fetch('/api/owner/boats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'ボート一覧の取得に失敗しました。');
        }
        return res.json();
      })
      .then((data) => {
        const options = (data || []).map((b: any) => ({ id: String(b.id), name: b.name ?? `船 #${b.id}` }));
        setBoats(options);
        if (options.length === 0) {
          setError('登録されている船がありません。先に船を登録してください。');
        }
      })
      .catch((err) => {
        console.error('ボート取得エラー:', err);
        setError(err.message || 'ボート一覧の取得に失敗しました。');
        setBoats([]);
      });

    // テンプレート一覧取得
    fetch('/api/owner/plan-templates', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          return res.json();
        }
        return [];
      })
      .then((data) => {
        setTemplates(data || []);
      })
      .catch((err) => {
        console.error('テンプレート取得エラー:', err);
      });
  }, []);

  // 日付の追加・削除
  const toggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // 指定月のカレンダー日付配列を返す
  function getMonthDates(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];
    // 1日が何曜日か
    let startWeek = firstDay.getDay();
    // 前月の末日から埋める
    for (let i = 0; i < startWeek; i++) {
      dates.push(null);
    }
    // 今月の日付
    for (let d = 1; d <= lastDay.getDate(); d++) {
      dates.push(new Date(year, month, d));
    }
    // 末日後の空白
    while (dates.length % 7 !== 0) {
      dates.push(null);
    }
    // 週ごとに分割
    const weeks = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7));
    }
    return weeks;
  }

  // テンプレートから複数日でプラン作成
  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || selectedDates.length === 0) {
      setError('テンプレートと日付を選択してください');
      return;
    }

    setError('');
    setSuccess(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('ログインが必要です');
      return;
    }

    try {
      // 選択した日付分だけプランを作成
      const promises = selectedDates.map(date => 
        fetch('/api/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: selectedTemplate.name,
            description: selectedTemplate.description || '',
            fishType: selectedTemplate.fishType,
            price: selectedTemplate.price,
            maxPeople: selectedTemplate.maxPeople,
            date: new Date(date).toISOString(),
            boatId: selectedTemplate.boatId,
            templateId: selectedTemplate.id,
            // 時間はテンプレートの出港/帰港時刻を送る
            departureTime: selectedTemplate.departureTime,
            returnTime: selectedTemplate.returnTime
          })
        }).then(async r => {
          if (r.ok) return { ok: true };
          let msg = '';
          try {
            const data = await r.json();
            msg = data?.message || r.statusText;
          } catch {
            msg = r.statusText;
          }
          return { ok: false, message: msg };
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok);
      const failedCount = failed.length;
      const successCount = results.length - failedCount;

      if (successCount > 0) {
        setSuccess(true);
        setError(failedCount > 0 ? `${results.length}件中${successCount}件作成成功、${failedCount}件失敗しました\n${failed.map(f=>f.message).join('\n')}` : '');
        setTimeout(() => {
          router.push('/owner/dashboard');
        }, 2000);
      } else {
        setError(`${results.length}件すべての作成に失敗しました\n${failed.map(f=>f.message).join('\n')}`);
      }
    } catch (err: any) {
      console.error('プラン作成エラー:', err);
      setError(err.message || 'プラン作成に失敗しました');
    }
  };

  const onSubmit: SubmitHandler<PlanFormData> = async (data: PlanFormData) => {
    setError('');
    setSuccess(false);

    const fixedData = { ...data, boatId: data.boatId || undefined };

    try {
      await axios.post('/api/plans', fixedData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/owner/dashboard');
      }, 2000);
    } catch (err) {
      console.error('プランの追加中にエラーが発生しました:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 400) {
            setError(err.response.data.message || '入力内容が正しくありません。');
          } else if (err.response.status === 500) {
            setError('サーバーでエラーが発生しました。時間をおいて再度お試しください。');
          } else {
            setError(`エラーが発生しました: ${err.response.data.message || err.response.status}`);
          }
        } else if (err.request) {
          setError('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
        }
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-[#1D3557]">
            <i className="fas fa-calendar-plus mr-3 text-[#457B9D]"></i>
            新規プラン追加
          </h1>
          <Link href="/owner/dashboard" className="quick-action-button !bg-[#A8DADC] !text-[#1D3557] hover:!bg-[#457B9D] hover:!text-white !px-6 !py-3">
            <i className="fas fa-arrow-left mr-2"></i>
            ダッシュボードへ戻る
          </Link>
        </div>

        {/* モード切替（ドロップダウン） */}
        <div className="mb-8 flex items-center gap-4">
          <label htmlFor="mode-select" className="form-label mr-2 text-lg text-[#1D3557] font-bold flex items-center">
            <i className="fas fa-cogs mr-2"></i>
            作成方法を選択：
          </label>
          <select
            id="mode-select"
            value={mode}
            onChange={e => setMode(e.target.value as 'template' | 'manual')}
            className="form-input !w-60 !py-3 !text-lg !rounded-lg !font-bold !bg-white !border-[#A8DADC] !text-[#1D3557]"
          >
            <option value="template">テンプレートから作成（おすすめ）</option>
            <option value="manual">手動で入力</option>
          </select>
        </div>

        <div className="info-card !p-8 !rounded-2xl !shadow-xl">

        {/* テンプレートモード */}
        {mode === 'template' && (
          <div className="space-y-6">
            {templates.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">テンプレートがまだありません</p>
                <Link href="/owner/plan-templates" className="text-blue-600 hover:underline font-semibold">
                  テンプレートを作成する →
                </Link>
              </div>
            ) : (
              <>
                {/* ステップ1: テンプレート選択 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {templates.map(template => (
                    <div key={template.id} className="w-full">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                        className={`w-full transition-all border-3 rounded-xl p-6 text-center font-bold shadow-lg hover:shadow-xl duration-200 ${
                          selectedTemplate?.id === template.id
                            ? 'border-[#457B9D] bg-gradient-to-br from-[#457B9D] to-[#1D3557] text-white scale-105'
                            : 'border-[#A8DADC] bg-white text-[#1D3557] hover:border-[#457B9D] hover:bg-[#F4F6F9]'
                        }`}
                      >
                        <div className="text-2xl mb-3">
                          <i className="fas fa-ship mr-2"></i>
                          {template.name}
                        </div>
                        <div className={`text-sm ${selectedTemplate?.id === template.id ? 'text-white/90' : 'text-gray-600'}`}>
                          {template.boat.name}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <div className="mt-4 pt-4 border-t border-white/30">
                            <i className="fas fa-check-circle text-2xl"></i>
                          </div>
                        )}
                      </button>
                      
                      {/* 詳細・カレンダーをアコーディオン展開 */}
                      {selectedTemplate?.id === template.id && (
                        <div className="w-full mt-6 col-span-full animate-fade-in">
                          {/* 詳細表示 */}
                          <div className="info-card !bg-gradient-to-r !from-blue-50 !to-cyan-50 border-2 border-[#457B9D] p-6 mb-6">
                            <h3 className="text-2xl font-bold mb-4 text-[#1D3557] flex items-center gap-2">
                              <i className="fas fa-info-circle text-[#457B9D]"></i>
                              プラン詳細
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-sm text-gray-600 mb-1">
                                  <i className="fas fa-ship mr-1"></i>
                                  船舶
                                </div>
                                <div className="font-bold text-[#1D3557]">{template.boat.name}</div>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-sm text-gray-600 mb-1">
                                  <i className="fas fa-fish mr-1"></i>
                                  魚種
                                </div>
                                <div className="font-bold text-[#1D3557]">{template.fishType}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-sm text-gray-600 mb-1">
                                  <i className="fas fa-yen-sign mr-1"></i>
                                  料金
                                </div>
                                <div className="font-bold text-xl text-[#457B9D]">¥{template.price.toLocaleString()}</div>
                              </div>
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-sm text-gray-600 mb-1">
                                  <i className="fas fa-clock mr-1"></i>
                                  時間
                                </div>
                                <div className="font-bold text-[#457B9D]">{template.departureTime}～{template.returnTime}</div>
                              </div>
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-sm text-gray-600 mb-1">
                                  <i className="fas fa-users mr-1"></i>
                                  定員
                                </div>
                                <div className="font-bold text-xl text-[#457B9D]">{template.maxPeople}名</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* カレンダーUI（予約管理画面と同じデザイン） */}
                          <div className="booking-calendar-card">
                            {/* カレンダーヘッダー */}
                            <div className="calendar-header">
                              <button
                                type="button"
                                onClick={() => {
                                  const newMonth = calendarMonth - 1;
                                  if (newMonth < 0) {
                                    setCalendarYear(calendarYear - 1);
                                    setCalendarMonth(11);
                                  } else {
                                    setCalendarMonth(newMonth);
                                  }
                                }}
                                className="calendar-nav-button"
                                aria-label="前の月"
                              >
                                <i className="fas fa-chevron-left"></i>
                              </button>
                              <h2 className="calendar-title">
                                {calendarYear}年 {calendarMonth + 1}月
                              </h2>
                              <button
                                type="button"
                                onClick={() => {
                                  const newMonth = calendarMonth + 1;
                                  if (newMonth > 11) {
                                    setCalendarYear(calendarYear + 1);
                                    setCalendarMonth(0);
                                  } else {
                                    setCalendarMonth(newMonth);
                                  }
                                }}
                                className="calendar-nav-button"
                                aria-label="次の月"
                              >
                                <i className="fas fa-chevron-right"></i>
                              </button>
                            </div>

                            {/* 曜日ヘッダー */}
                            <div className="calendar-weekdays">
                              {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                                <div
                                  key={day}
                                  className={`weekday-label ${i === 0 ? 'sunday' : ''} ${i === 6 ? 'saturday' : ''}`}
                                >
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* 日付グリッド */}
                            <div className="calendar-grid">
                              {getMonthDates(calendarYear, calendarMonth).flat().map((dateObj, i) => {
                                if (!dateObj) {
                                  return (
                                    <div
                                      key={`empty-${i}`}
                                      className="date-cell out-of-month"
                                      style={{ cursor: 'default' }}
                                    ></div>
                                  );
                                }
                                const dateStr = dateObj.toISOString().split('T')[0];
                                const isSelected = selectedDates.includes(dateStr);
                                const isSunday = dateObj.getDay() === 0;
                                const isSaturday = dateObj.getDay() === 6;
                                const isHol = isHoliday(dateStr);
                                
                                return (
                                  <div
                                    key={dateStr}
                                    className={`date-cell ${isSelected ? 'selected-date-cell' : ''}`}
                                    onClick={() => toggleDate(dateStr)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className={`date-number ${isSunday || isHol ? 'sunday-date' : ''} ${isSaturday ? 'saturday-date' : ''}`}>
                                      {dateObj.getDate()}
                                    </div>
                                    
                                    {/* 選択インジケーター */}
                                    {isSelected && (
                                      <div className="selected-indicator">
                                        <i className="fas fa-check-circle"></i>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* 選択状況の表示 */}
                            {selectedDates.length > 0 && (
                              <div className="selected-dates-summary">
                                <div className="summary-content">
                                  <i className="fas fa-calendar-check"></i>
                                  <span className="summary-text">
                                    <strong>{selectedDates.length}日</strong> 選択中
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* 作成ボタン */}
                          {selectedDates.length > 0 && (
                            <div className="info-card !bg-gradient-to-r !from-green-50 !to-emerald-50 border-2 border-green-500 p-6 mt-6">
                              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1D3557]">
                                <span className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">
                                  <i className="fas fa-check"></i>
                                </span>
                                確認して作成
                              </h3>
                              <div className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200">
                                <p className="text-lg text-gray-700">
                                  <i className="fas fa-ship text-[#457B9D] mr-2"></i>
                                  <strong className="text-[#1D3557]">{template.name}</strong> を 
                                  <strong className="text-green-600 mx-2">{selectedDates.length}日分</strong> 
                                  作成します
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleCreateFromTemplate}
                                disabled={isSubmitting}
                                className="quick-action-button w-full !bg-green-600 !text-white !py-4 !text-lg hover:!bg-green-700 disabled:!bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                              >
                                <i className="fas fa-plus-circle mr-2"></i>
                                {isSubmitting ? '作成中...' : `${selectedDates.length}件のプランを作成`}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 手動入力モード */}
        {mode === 'manual' && (
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="船（必須）" error={errors.boatId as any}>
            <select
              {...register('boatId', { required: '船を選択してください。' })}
              className="form-input"
              defaultValue={''}
           >
              <option value="" disabled>
                選択してください
              </option>
              {boats.map((b) => (
                <option key={String(b.id)} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="タイトル" error={errors.title}>
            <input
              type="text"
              {...register('title', { required: 'タイトルは必須です。' })}
              className="form-input"
              placeholder="例: 三浦半島 マダイ釣り半日コース"
            />
          </FormField>
          <FormField label="エリア" error={errors.area}>
            <input
              type="text"
              {...register('area', { required: 'エリアは必須です。' })}
              className="form-input"
              placeholder="例: 三浦半島"
            />
          </FormField>
          <FormField label="料金" error={errors.price}>
            <input
              type="number"
              {...register('price', { required: '料金は必須です。', valueAsNumber: true, min: { value: 0, message: '0以上の数値を入力してください。' } })}
              className="form-input"
              placeholder="例: 12000"
            />
          </FormField>
          <FormField label="対象魚種（カンマ区切り）" error={errors.fishTypes}>
            <input
              type="text"
              {...register('fishTypes', { required: '対象魚種は必須です。' })}
              className="form-input"
              placeholder="例: マダイ,イサキ,アジ"
            />
          </FormField>
          <FormField label="説明" error={errors.description}>
            <textarea
              {...register('description', { required: '説明は必須です。' })}
              className="form-textarea"
              rows={4}
              placeholder="プランの詳細な説明を入力してください。"
            ></textarea>
          </FormField>
          <FormField label="曜日" error={errors.weekday}>
            <select
              {...register('weekday', { required: '曜日は必須です。' })}
              className="form-input"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="最大定員" error={errors.maxCapacity}>
              <input
                type="number"
                {...register('maxCapacity', { required: '最大定員は必須です。', valueAsNumber: true, min: { value: 1, message: '1以上の数値を入力してください。' } })}
                className="form-input"
                placeholder="例: 10"
              />
            </FormField>
            <FormField label="画像URL（任意）" error={errors.imageUrl}>
              <input
                type="url"
                {...register('imageUrl')}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="出港時刻" error={errors.departureTime}>
              <input
                type="time"
                {...register('departureTime', { required: '出港時刻は必須です。' })}
                className="form-input"
              />
            </FormField>
            <FormField label="帰港時刻" error={errors.returnTime}>
              <input
                type="time"
                {...register('returnTime', { required: '帰港時刻は必須です。' })}
                className="form-input"
              />
            </FormField>
          </div>
          <FormField label="集合場所" error={errors.meetingPlace}>
            <input
              type="text"
              {...register('meetingPlace', { required: '集合場所は必須です。' })}
              className="form-input"
              placeholder="例: 〇〇漁港"
            />
          </FormField>
          
          <div className="pt-6 border-t-2 border-gray-200 flex gap-4">
            <Link href="/owner/dashboard" className="quick-action-button flex-1 !bg-gray-400 !text-white hover:!bg-gray-500">
              <i className="fas fa-times mr-2"></i>
              キャンセル
            </Link>
            <button
              type="submit"
              className="quick-action-button flex-1 !bg-[#457B9D] !text-white hover:!bg-[#1D3557] disabled:!bg-gray-400 !py-3"
              disabled={isSubmitting}
            >
              <i className="fas fa-plus-circle mr-2"></i>
              {isSubmitting ? '追加中...' : 'プランを追加'}
            </button>
          </div>
        </form>
        )}

        {/* 共通エラー/成功メッセージ */}
        {success && mode === 'template' && (
          <div className="mt-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
            <p className="text-green-700 flex items-center gap-2">
              <i className="fas fa-check-circle text-xl"></i>
              プランの作成処理が完了しました。
            </p>
          </div>
        )}
        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-red-700 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-xl"></i>
              {error}
            </p>
          </div>
        )}
        {/* info-card閉じタグ */}
        </div>
      </div>
    </div>
  );
}
