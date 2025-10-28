"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Boat } from '../src/types/index';

export default function BoatSearch() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<Boat[]>([]);

  useEffect(() => {
    fetch('/api/boats')
      .then((res) => res.json())
      .then((data) => setBoats(data));
  }, []);

  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }
    setFiltered(
      boats.filter((b) =>
        b.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, boats]);

  return (
    <div style={{ marginBottom: 24 }}>
      <input
        type="text"
        placeholder="釣り船名で検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, width: 240, borderRadius: 4, border: '1px solid #ccc' }}
      />
      {filtered.length > 0 && (
        <ul style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4, marginTop: 4, maxHeight: 200, overflowY: 'auto', position: 'absolute', zIndex: 10, width: 240 }}>
          {filtered.map((boat) => (
            <li key={boat.id} style={{ padding: 8 }}>
              <Link href={`/boats/${boat.id}`}>{boat.name}（{boat.area}）</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
