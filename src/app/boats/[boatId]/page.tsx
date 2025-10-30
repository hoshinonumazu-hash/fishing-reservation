"use client";

import React, { useEffect, useState, useMemo } from 'react';
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
    // ...existing code...
type CalendarFilterProps = {
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
};

function CalendarFilter(props: CalendarFilterProps) {
  const { selectedDate, setSelectedDate } = props;
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
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="calendar-nav-button" aria-label="前の月">
          <i className="fas fa-chevron-left"></i>
        </button>
        <h2 className="calendar-title">{monthLabel}</h2>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="calendar-nav-button" aria-label="次の月">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="calendar-weekdays">
        {["日","月","火","水","木","金","土"].map((d, idx) => (
          <div key={d} className={`weekday-label ${idx === 0 ? "sunday" : ""} ${idx === 6 ? "saturday" : ""}`}>{d}</div>
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
              <div className={`date-number ${isSunday ? "sunday-date" : ""} ${isSaturday ? "saturday-date" : ""}`}>{d?.getDate() || ""}</div>
            </div>
          );
        })}
      </div>
      {selectedDate && (
        <div className="mt-2">
          <button onClick={() => setSelectedDate(null)} className="quick-action-button ml-2">
            <i className="fas fa-times mr-1"></i>クリア
          </button>
        </div>
      )}
    </div>

