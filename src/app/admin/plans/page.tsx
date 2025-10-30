
"use client";
import PlanTable from "./PlanTable";

export default function AdminPlans() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1D3557] mb-4">
        <i className="fas fa-calendar-alt mr-2 text-[#457B9D]"></i>
        予約プラン管理
      </h1>
  <PlanTable />
    </div>
  );
}
