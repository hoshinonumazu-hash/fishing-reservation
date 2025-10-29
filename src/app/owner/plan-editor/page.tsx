"use client";

import { useEffect, useState } from "react";
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
}

export default function PlanEditorPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [plans, setPlans] = useState<FishingPlan[]>([]);
  const [allPlans, setAllPlans] = useState<FishingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [boats, setBoats] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<FishingPlan | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

  // 日付選択時にその日のプランを絞り込み
  useEffect(() => {
    if (selectedDate && allPlans.length > 0) {
      const filtered = allPlans.filter((plan) => {
        if (!plan.date) return false;
        const planDate = new Date(plan.date).toISOString().slice(0, 10);
        return planDate === selectedDate;
      });
      setPlans(filtered);
    } else {
      setPlans([]);
    }
  }, [selectedDate, allPlans]);

  // カレンダー生成
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendar: (number | null)[] = [];
    // 前月の空白
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push(null);
    }
    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(day);
    }

    return calendar;
  };

  const calendar = generateCalendar();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setEditingPlan(null);
  };

  const handleEditPlan = (plan: FishingPlan) => {
    setEditingPlan(plan);
  };

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

  // プランがある日付を取得
  const getDatesWithPlans = () => {
    const dates = new Set<string>();
    allPlans.forEach((plan) => {
      if (plan.date) {
        const dateStr = new Date(plan.date).toISOString().slice(0, 10);
        dates.add(dateStr);
      }
    });
    return dates;
  };

  const datesWithPlans = getDatesWithPlans();

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#1D3557] mb-6 flex items-center gap-3">
          <i className="fas fa-calendar-edit text-[#457B9D]"></i>
          予約プラン編集
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* カレンダー */}
            <div className="info-card">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded"
                  aria-label="前月"
                >
                  <i className="fas fa-chevron-left text-[#457B9D]"></i>
                </button>
                <h2 className="text-xl font-bold text-[#1D3557]">
                  {year}年 {month + 1}月
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded"
                  aria-label="次月"
                >
                  <i className="fas fa-chevron-right text-[#457B9D]"></i>
                </button>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["日", "月", "火", "水", "木", "金", "土"].map((day, idx) => (
                  <div
                    key={idx}
                    className={`text-center font-bold text-sm py-2 ${
                      idx === 0 ? "text-red-600" : idx === 6 ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* カレンダー本体 */}
              <div className="grid grid-cols-7 gap-1">
                {calendar.map((day, idx) => {
                  if (day === null) {
                    return <div key={idx} className="aspect-square"></div>;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(
                    2,
                    "0"
                  )}-${String(day).padStart(2, "0")}`;
                  const hasPlans = datesWithPlans.has(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const dayOfWeek = idx % 7;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square p-1 rounded transition-all relative
                        ${isSelected ? "bg-[#457B9D] text-white font-bold" : "hover:bg-gray-100"}
                        ${hasPlans && !isSelected ? "bg-[#FFD166]/20" : ""}
                        ${dayOfWeek === 0 ? "text-red-600" : dayOfWeek === 6 ? "text-blue-600" : "text-gray-700"}
                      `}
                    >
                      <span className={isSelected ? "text-white" : ""}>{day}</span>
                      {hasPlans && (
                        <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#457B9D]"}`}></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-4 p-3 bg-[#A8DADC]/10 rounded">
                  <p className="text-sm text-gray-700">
                    <i className="fas fa-calendar-day text-[#457B9D] mr-2"></i>
                    選択中: {new Date(selectedDate).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* プラン一覧・編集エリア */}
            <div className="info-card">
              {!selectedDate ? (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-hand-pointer text-4xl mb-3"></i>
                  <p>カレンダーから日付を選択してください</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-inbox text-4xl mb-3"></i>
                  <p>この日のプランはありません</p>
                </div>
              ) : editingPlan ? (
                <div>
                  <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2">
                    <i className="fas fa-edit text-[#457B9D]"></i>
                    プラン編集
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        プラン名
                      </label>
                      <input
                        type="text"
                        value={editingPlan.title}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, title: e.target.value })
                        }
                        className="form-input w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        日付
                      </label>
                      <input
                        type="date"
                        value={editingPlan.date.slice(0, 10)}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, date: e.target.value })
                        }
                        className="form-input w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        料金（円）
                      </label>
                      <input
                        type="number"
                        value={editingPlan.price}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            price: Number(e.target.value),
                          })
                        }
                        className="form-input w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        所要時間（分）
                      </label>
                      <input
                        type="number"
                        value={editingPlan.duration}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            duration: Number(e.target.value),
                          })
                        }
                        className="form-input w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        定員
                      </label>
                      <input
                        type="number"
                        value={editingPlan.maxPeople}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            maxPeople: Number(e.target.value),
                          })
                        }
                        className="form-input w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        対象魚種
                      </label>
                      <input
                        type="text"
                        value={editingPlan.fishType}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            fishType: e.target.value,
                          })
                        }
                        className="form-input w-full px-3 py-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        説明
                      </label>
                      <textarea
                        value={editingPlan.description}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            description: e.target.value,
                          })
                        }
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
                <div>
                  <h3 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2">
                    <i className="fas fa-list text-[#457B9D]"></i>
                    この日のプラン（{plans.length}件）
                  </h3>

                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border border-gray-200 rounded p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-[#1D3557] mb-1">
                              {plan.title}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <i className="fas fa-ship text-[#457B9D]"></i>
                              {plan.boat.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-[#457B9D]">
                              ¥{plan.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-700 space-y-1 mb-3">
                          <p className="flex items-center gap-2">
                            <i className="fas fa-clock w-4 text-[#457B9D]"></i>
                            所要時間: {plan.duration}分
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="fas fa-fish w-4 text-[#457B9D]"></i>
                            {plan.fishType}
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="fas fa-users w-4 text-[#457B9D]"></i>
                            定員 {plan.maxPeople}名
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="quick-action-button flex-1 text-sm"
                          >
                            <i className="fas fa-edit mr-1"></i>
                            編集
                          </button>
                          <button
                            onClick={() => handleCancelPlan(plan.id)}
                            className="quick-action-button !bg-red-600 hover:!bg-red-700 flex-1 text-sm"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
