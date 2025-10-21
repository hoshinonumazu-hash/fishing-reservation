import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FishingPlan, Boat } from '../../../types';

export default function EditPlanPage({ params }: { params: { boatId: string } }) {
  // TODO: 編集UI実装（現状はダミー）
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>プラン編集（未実装）</h1>
      <p>このページでプランの編集・削除ができるようにします。</p>
    </div>
  );
}
