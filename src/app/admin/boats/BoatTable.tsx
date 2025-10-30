"use client";
import { useEffect, useState } from "react";

export type Boat = {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  capacity: number;
};

export default function BoatTable() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetchBoats();
  }, []);
  const fetchBoats = async () => {
    const res = await fetch("/api/admin/boats");
    if (res.ok) {
      setBoats(await res.json());
    }
  };
  const filtered = boats.filter(b => b.name.includes(search) || b.ownerName.includes(search) || b.location.includes(search));
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="キーワード検索" className="border rounded px-2 py-1" />
      </div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="px-2 py-1">船名</th>
            <th className="px-2 py-1">オーナー</th>
            <th className="px-2 py-1">出港エリア</th>
            <th className="px-2 py-1">定員</th>
            <th className="px-2 py-1">操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(boat => (
            <tr key={boat.id}>
              <td className="px-2 py-1">{boat.name}</td>
              <td className="px-2 py-1">{boat.ownerName}</td>
              <td className="px-2 py-1">{boat.location}</td>
              <td className="px-2 py-1">{boat.capacity}</td>
              <td className="px-2 py-1 flex gap-2">
                <button className="text-blue-600 hover:underline">編集</button>
                <button className="text-red-600 hover:underline">削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
