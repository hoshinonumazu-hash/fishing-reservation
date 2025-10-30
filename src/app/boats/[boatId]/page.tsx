"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import type { FishingPlan } from '../../../types';

export default function BoatPlansPage() {
  const [plans, setPlans] = useState<FishingPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [boat, setBoat] = useState<any>(null);
  const [memo, setMemo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [boatName, setBoatName] = useState<string>("");
  const [recentFish, setRecentFish] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const params = useParams<{ boatId: string }>();
  const boatId = params?.boatId;

  useEffect(() => {
    if (!boatId) return;
    setLoading(true);
    fetch(`/api/plans?boatId=${boatId}`)
      .then((res) => res.json())
      .then((data) => setPlans(data));

    fetch(`/api/owner/boats`, {
      headers: {
        Authorization: typeof window !== 'undefined' && localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      },
    })
      .then((res) => res.json())
      .then((boats: any[]) => {
        const found = boats.find((b) => String(b.id) === String(boatId));
        setBoat(found || null);
        setBoatName(found?.name || "");
        setMemo(found?.memo || null);
        setRecentFish(found?.recentFish || null);
        setDescription(found?.description || null);
        setImageUrl(found?.imageUrl || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [boatId]);

  if (loading) return <div className="text-center mt-10 text-lg text-gray-600">読み込み中...</div>;

  // 日付でプランを絞り込み（カレンダー選択）
  const filteredPlans = selectedDate
    ? plans.filter((plan) => {
        if (!plan.date) return false;
        const planDate = new Date(plan.date);
        return (
          planDate.getFullYear() === selectedDate.getFullYear() &&
          planDate.getMonth() === selectedDate.getMonth() &&
          planDate.getDate() === selectedDate.getDate()
        );
      })
    : plans;

  return (
    <div className="add-plan-wrapper max-w-3xl mx-auto px-4 py-8">
      <h1 className="page-header text-2xl font-bold mb-4">{boatName || '船'}</h1>
        {memo && (
          <div className="info-card mb-4 text-base">
            <span className="font-bold">一言：</span>{memo}
          </div>
        )}
        {/* カレンダーUI（オーナー予約管理ページと同じ） */}
        <div className="mb-6">
          <label className="font-bold block mb-2">
            <i className="fas fa-calendar-alt mr-2 text-[#457B9D]"></i>
            日にちで絞り込む
          </label>
          <CalendarFilter selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </div>
  <ul className="mt-6" style={{ listStyle: 'none', paddingLeft: 0 }}>
          {filteredPlans.length === 0 && <li className="text-gray-500">該当するプランがありません</li>}
          {filteredPlans.map((plan) => {
            const p: any = plan as any;
            return (
              <li key={String(p.id)} className="info-card mb-6">
                <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                <div className="mb-1">実施日: {p.date ?? '-'}</div>
                <div className="mb-1">料金: {p.price}円</div>
                <div className="mb-1">対象魚種: {Array.isArray(p.fishTypes) ? p.fishTypes.join(', ') : '-'}</div>
                <div className="mb-1">出船: {p.departureTime} / 帰港: {p.returnTime}</div>
                <div className="mb-1">定員: {p.maxCapacity}人</div>
                <div className="mb-1">集合場所: {p.meetingPlace}</div>
                <div className="mb-2">{p.description}</div>
                <div className="mt-4 text-center">
                  <a
                    href={`/reserve?planId=${p.id}`}
                    className="quick-action-button text-lg px-8 py-3"
                    style={{ display: 'inline-block', minWidth: 180 }}
                  >
                    予約に進む
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
  );
}

// カレンダーUIコンポーネント（オーナー予約管理ページから移植）
type CalendarFilterProps = {
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
};

function CalendarFilter({ selectedDate, setSelectedDate }: CalendarFilterProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = selectedDate || new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  const startOfMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth]);
  const endOfMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), [currentMonth]);
  const startWeekday = useMemo(() => startOfMonth.getDay(), [startOfMonth]);
  const daysInMonth = useMemo(() => endOfMonth.getDate(), [endOfMonth]);
  const monthLabel = useMemo(() => `${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`, [currentMonth]);
  
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

  return (
    <div className="booking-calendar-card">
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
      
      <div className="calendar-weekdays">
        {["日","月","火","水","木","金","土"].map((d, idx) => (
          <div 
            key={d} 
            className={`weekday-label ${idx === 0 ? "sunday" : ""} ${idx === 6 ? "saturday" : ""}`}
          >
            {d}
          </div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {calendarCells.flat().map((cell, idx) => {
          const d = cell.date;
          const inMonth = !!d;
          const isSelected = selectedDate && d && selectedDate.toDateString() === d.toDateString();
          const isSunday = d && d.getDay() === 0;
          const isSaturday = d && d.getDay() === 6;
          
          return (
            <div
              key={d ? d.toISOString() : `empty-${idx}`}
              className={`date-cell ${!inMonth ? "out-of-month" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => d && setSelectedDate(d)}
              style={{ cursor: d ? "pointer" : "default" }}
            >
              <div className={`date-number ${isSunday ? "sunday-date" : ""} ${isSaturday ? "saturday-date" : ""}`}>
                {d?.getDate() || ""}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedDate && (
        <div className="mt-2">
          <button 
            onClick={() => setSelectedDate(null)} 
            className="quick-action-button ml-2"
          >
            <i className="fas fa-times mr-1"></i>クリア
          </button>
        </div>
      )}
    </div>
  );
}
