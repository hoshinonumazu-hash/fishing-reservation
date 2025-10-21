import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FishingPlan, Boat } from '../../../types';
import Link from 'next/link';

export default function BoatPlansPage({ params }: { params: { boatId: string } }) {
  const [plans, setPlans] = useState<FishingPlan[]>([]);
  const [boat, setBoat] = useState<Boat | null>(null);
  const boatId = params.boatId;

  useEffect(() => {
    fetch(`/api/plans?boatId=${boatId}`)
      .then((res) => res.json())
      .then((data) => setPlans(data));
    fetch(`/api/boats`)
      .then((res) => res.json())
      .then((boats: Boat[]) => setBoat(boats.find((b) => String(b.id) === String(boatId)) || null));
  }, [boatId]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>{boat ? `${boat.name}のプラン管理` : '船のプラン管理'}</h1>
      <Link href="/add-plan">＋新規プラン追加</Link>
      <ul style={{ marginTop: 24 }}>
        {plans.length === 0 && <li>プランがありません</li>}
        {plans.map((plan) => (
          <li key={plan.id} style={{ border: '1px solid #ccc', borderRadius: 8, marginBottom: 16, padding: 16 }}>
            <h3>{plan.title}</h3>
            <div>曜日: {plan.weekday}</div>
            <div>料金: {plan.price}円</div>
            <div>対象魚種: {plan.fishTypes.join(', ')}</div>
            <div>出船: {plan.departureTime} / 帰港: {plan.returnTime}</div>
            <div>定員: {plan.maxCapacity}人</div>
            <div>集合場所: {plan.meetingPlace}</div>
            <div>{plan.description}</div>
            {/* 編集・削除ボタンは今後実装 */}
          </li>
        ))}
      </ul>
    </div>
  );
}
