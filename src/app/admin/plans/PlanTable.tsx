"use client";
import { useEffect, useState } from "react";

export type Plan = {
  id: string;
  title: string;
  boatName: string;
  price: number;
  date: string;
};

export default function PlanTable() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetchPlans();
  }, []);
  const fetchPlans = async () => {
    const res = await fetch("/api/admin/plans");
    if (res.ok) {
      setPlans(await res.json());
    }
  };
  const filtered = plans.filter(p => p.title.includes(search) || p.boatName.includes(search));
  const handleDelete = async (id: string) => {
    if (!window.confirm("本当に削除しますか？")) return;
    const res = await fetch("/api/admin/plans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPlans(plans.filter(p => p.id !== id));
    } else {
      alert("削除に失敗しました");
    }
  };
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="キーワード検索" className="border rounded px-2 py-1" />
      </div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="px-2 py-1">タイトル</th>
            <th className="px-2 py-1">船名</th>
            <th className="px-2 py-1">料金</th>
            <th className="px-2 py-1">日付</th>
            <th className="px-2 py-1">操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(plan => (
            <tr key={plan.id}>
              <td className="px-2 py-1">{plan.title}</td>
              <td className="px-2 py-1">{plan.boatName}</td>
              <td className="px-2 py-1">{plan.price}円</td>
              <td className="px-2 py-1">{plan.date}</td>
              <td className="px-2 py-1 flex gap-2">
                <button className="text-blue-600 hover:underline">編集</button>
                <button className="text-red-600 hover:underline" onClick={() => handleDelete(plan.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
