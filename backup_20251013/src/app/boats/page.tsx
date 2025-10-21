import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Boat } from '../../types';

export default function BoatsListPage() {
  const [boats, setBoats] = useState<Boat[]>([]);

  useEffect(() => {
    fetch('/api/boats')
      .then((res) => res.json())
      .then((data) => setBoats(data));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>釣り船一覧</h1>
      <ul>
        {boats.map((boat) => (
          <li key={boat.id} style={{ marginBottom: 16 }}>
            <Link href={`/boats/${boat.id}`}>{boat.name}（{boat.area}）</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
