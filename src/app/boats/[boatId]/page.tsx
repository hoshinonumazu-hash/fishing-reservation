"use client";



import { useEffect, useState } from 'react';
import type { FishingPlan } from '../../../types';

export default function BoatPlansPage({ params }: { params: { boatId: string } }) {
  const [plans, setPlans] = useState<FishingPlan[]>([]);
  const [date, setDate] = useState<string>("");
  const [boat, setBoat] = useState<any>(null);
  const [memo, setMemo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [boatName, setBoatName] = useState<string>("");
  const [recentFish, setRecentFish] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { boatId } = params;

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

  // 日付でプランを絞り込み
  const filteredPlans = date
    ? plans.filter((plan) => {
        if (!plan.date) return false;
        // plan.dateはISO文字列想定
        const planDate = plan.date.slice(0, 10);
        return planDate === date;
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
        {/* 日付指定フォーム */}
        <div className="mb-6">
          <label className="font-bold block mb-2">
            <i className="fas fa-calendar-alt mr-2 text-[#457B9D]"></i>
            日にちで絞り込む
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="form-input px-3 py-2 rounded border border-gray-300 flex-1 max-w-xs"
              placeholder="日付を選択してください"
            />
            {date && (
              <button onClick={()=>setDate("")} className="quick-action-button ml-2">
                <i className="fas fa-times mr-1"></i>クリア
              </button>
            )}
          </div>
        </div>
        <ul className="mt-6">
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
