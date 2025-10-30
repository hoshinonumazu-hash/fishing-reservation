
"use client";
import BoatTable from "./BoatTable";

export default function AdminBoats() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1D3557] mb-4">
        <i className="fas fa-ship mr-2 text-[#457B9D]"></i>
        登録船舶管理
      </h1>
  <BoatTable />
    </div>
  );
}
