"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface FishingPlan {
  id: string;
  title: string;
  date: string;
  price: number;
  fishType: string;
  duration: number;
  maxPeople: number;
  description: string;
  boat: {
    id: string;
    name: string;
  };
  template?: {
    id: string;
    name: string;
  } | null;
}

export default function PlanEditorPage() {
  const router = useRouter();
  const [allPlans, setAllPlans] = useState<FishingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [boats, setBoats] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<FishingPlan | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 認証チェック
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "BOAT_OWNER") {
      alert("オーナー権限が必要です");
      router.push("/login");
      return;
    }
    fetchBoatsAndPlans();
  }, []);

  const fetchBoatsAndPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const boatsRes = await fetch("/api/owner/boats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const boatsData = await boatsRes.json();
      setBoats(boatsData);

      // すべてのプランを取得
      const allPlansPromises = boatsData.map((boat: any) =>
        fetch(`/api/plans?boatId=${boat.id}`).then((res) => res.json())
      );
      const allPlansData = await Promise.all(allPlansPromises);
      const flatPlans = allPlansData.flat();
      setAllPlans(flatPlans);
    } catch (error) {
      console.error("データ取得エラー:", error);
      alert("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // カレンダー生成用ヘルパー
  const monthLabel = useMemo(() => {
    return `${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`;
  }, [currentMonth]);

  const startOfMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth]);
  const endOfMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), [currentMonth]);
  const startWeekday = useMemo(() => startOfMonth.getDay(), [startOfMonth]); // 日曜起点
  const daysInMonth = useMemo(() => endOfMonth.getDate(), [endOfMonth]);

  const calendarCells = useMemo(() => {
    const cells: Array<{ date: Date | null }[]> = [];
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
    let cur = 1 - startWeekday;
    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / 7);
      if (!cells[row]) cells[row] = [];
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), cur);
      const inMonth = cur >= 1 && cur <= daysInMonth;
      cells[row].push({ date: inMonth ? d : null });
      cur++;
    }
    return cells;
  }, [currentMonth, startWeekday, daysInMonth]);

  // 日毎のプランをグルーピング
  const plansByDay = useMemo(() => {
    const map = new Map<string, FishingPlan[]>();
    for (const p of allPlans) {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(p);
      map.set(key, arr);
    }
    return map;
  }, [allPlans]);

  const selectedDayPlans = useMemo(() => {
    if (!selectedDate) return [] as FishingPlan[];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return plansByDay.get(key) || [];
  }, [selectedDate, plansByDay]);

  // テンプレートカラーのマッピング（固定パレット）
  const templateColorMap = useMemo(() => {
    const colors = [
      '#e53935', // red
      '#1e88e5', // blue
      '#43a047', // green
      '#8e24aa', // purple
      '#fb8c00', // orange
      '#00acc1', // cyan
      '#6d4c41', // brown
    ];
    const uniqueKeys = new Set<string>();
    for (const p of allPlans) {
      uniqueKeys.add(p.template?.id || `plan:${p.id}`);
    }
    const sortedKeys = Array.from(uniqueKeys).sort();
    const map = new Map<string, string>();
    sortedKeys.forEach((k, i) => map.set(k, colors[i % colors.length]));
    return map;
  }, [allPlans]);

  const handleCancelPlan = async (planId: string) => {
    if (!confirm("このプランを削除しますか？")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/plans/${planId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("削除に失敗しました");

      alert("プランを削除しました");
      fetchBoatsAndPlans();
      setEditingPlan(null);
    } catch (error) {
      alert("削除に失敗しました");
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/plans/${editingPlan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingPlan.title,
          date: editingPlan.date,
          price: Number(editingPlan.price),
          fishType: editingPlan.fishType,
          duration: Number(editingPlan.duration),
          maxPeople: Number(editingPlan.maxPeople),
          description: editingPlan.description,
        }),
      });

      if (!res.ok) throw new Error("更新に失敗しました");

      alert("プランを更新しました");
      fetchBoatsAndPlans();
      setEditingPlan(null);
    } catch (error) {
      alert("更新に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">予約プラン編集</h1>
        <p className="text-gray-600">カレンダーから日付を選択してプランを編集できます</p>
      </div>

      {/* カレンダー */}
      <div className="booking-calendar-card">
        {/* カレンダーヘッダー */}
        <div className="calendar-header">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="calendar-nav-button"
            aria-label="前の月"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2 className="calendar-title">{monthLabel}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="calendar-nav-button"
            aria-label="次の月"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="calendar-weekdays">
          {['日','月','火','水','木','金','土'].map((d, idx) => (
            <div 
              key={d} 
              className={`weekday-label ${idx === 0 ? 'sunday' : ''} ${idx === 6 ? 'saturday' : ''}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="calendar-grid">
          {calendarCells.flat().map((cell, idx) => {
            const d = cell.date;
            const inMonth = !!d;
            const key = d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : `empty-${idx}`;
            const dayPlans = d ? plansByDay.get(key) || [] : [];
            const isSelected = selectedDate && d && selectedDate.toDateString() === d.toDateString();
            const isSunday = d && d.getDay() === 0;
            const isSaturday = d && d.getDay() === 6;
            const hasPlans = dayPlans.length > 0;
            
            return (
              <div
                key={key}
                className={`date-cell ${!inMonth ? 'out-of-month' : ''} ${isSelected ? 'selected' : ''} ${hasPlans ? 'has-bookings' : ''}`}
                onClick={() => d && setSelectedDate(d)}
                style={{ cursor: d ? 'pointer' : 'default' }}
              >
                <div className={`date-number ${isSunday ? 'sunday-date' : ''} ${isSaturday ? 'saturday-date' : ''}`}>
                  {d?.getDate() || ''}
                </div>
                
                {/* プラン件数バッジ */}
                {hasPlans && (
                  <div className="booking-status-badge">
                    {dayPlans.length}件
                  </div>
                )}
                
                {/* プランドット表示 */}
                <div className="plan-dots">
                  {dayPlans.slice(0, 4).map((p) => {
                    const colorKey = p.template?.id || `plan:${p.id}`;
                    const color = templateColorMap.get(colorKey) || '#1e88e5';
                    return (
                      <span
                        key={p.id}
                        title={`${p.template?.name || p.title}`}
                        className="plan-dot"
                        style={{ backgroundColor: color }}
                      ></span>
                    );
                  })}
                  {dayPlans.length > 4 && (
                    <span className="plan-dot-more">+{dayPlans.length - 4}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="calendar-legend">
          {[...templateColorMap.entries()].slice(0, 8).map(([key, color]) => (
            <div key={key} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: color }}></span>
              <span className="legend-label">
                {allPlans.find(p => (p.template?.id || `plan:${p.id}`) === key)?.template?.name
                  || allPlans.find(p => `plan:${p.id}` === key)?.title
                  || 'プラン'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 選択日の詳細 */}
      <div className="space-y-4">
        {selectedDate ? (
          selectedDayPlans.length === 0 ? (
            <div className="info-card text-center py-10">
              <div className="boat-icon mb-2"><i className="fas fa-inbox"></i></div>
              <p className="text-gray-600">この日にはプランがありません</p>
            </div>
          ) : editingPlan ? (
            <div className="info-card">
              <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2">
                <i className="fas fa-edit text-[#457B9D]"></i>
                プラン編集
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-1 text-gray-700">プラン名</label>
                  <input
                    type="text"
                    value={editingPlan.title}
                    onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                    className="form-input w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">日付</label>
                  <input
                    type="date"
                    value={editingPlan.date.slice(0, 10)}
                    onChange={(e) => setEditingPlan({ ...editingPlan, date: e.target.value })}
                    className="form-input w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">料金（円）</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                    className="form-input w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">所要時間（分）</label>
                  <input
                    type="number"
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan({ ...editingPlan, duration: Number(e.target.value) })}
                    className="form-input w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">定員</label>
                  <input
                    type="number"
                    value={editingPlan.maxPeople}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxPeople: Number(e.target.value) })}
                    className="form-input w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">対象魚種</label>
                  <input
                    type="text"
                    value={editingPlan.fishType}
                    onChange={(e) => setEditingPlan({ ...editingPlan, fishType: e.target.value })}
                    className="form-input w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">説明</label>
                  <textarea
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    className="form-input w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSavePlan}
                    className="quick-action-button flex-1"
                  >
                    <i className="fas fa-save mr-2"></i>
                    保存
                  </button>
                  <button
                    onClick={() => setEditingPlan(null)}
                    className="quick-action-button !bg-gray-500 hover:!bg-gray-600 flex-1"
                  >
                    <i className="fas fa-times mr-2"></i>
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          ) : (
            selectedDayPlans.map((plan) => (
              <div key={plan.id} className="info-card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* プラン情報 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{plan.title}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <i className="fas fa-ship boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">船名:</span> 
                        <span className="ml-1">{plan.boat.name}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-calendar-day boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">実施日:</span> 
                        <span className="ml-1">{new Date(plan.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-fish boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">魚種:</span> 
                        <span className="ml-1">{plan.fishType}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-clock boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">所要時間:</span> 
                        <span className="ml-1">{plan.duration}分</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-users boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">定員:</span> 
                        <span className="ml-1">{plan.maxPeople} 名</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-yen-sign boat-icon !text-lg mr-2"></i>
                        <span className="font-medium">金額:</span> 
                        <span className="text-lg font-bold boat-link ml-1">
                          ¥{plan.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      編集
                    </button>
                    <button
                      onClick={() => handleCancelPlan(plan.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition"
                    >
                      <i className="fas fa-trash mr-2"></i>
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <div className="info-card text-center py-8 text-gray-600">日付をクリックすると、その日のプランが表示されます</div>
        )}
      </div>
    </div>
  );
}
