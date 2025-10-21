import * as React from 'react';
import type { FishingPlan } from '../src/types/index';


interface FishingPlanListProps {
  plans: FishingPlan[];
}

export default function FishingPlanList({ plans = [] }: FishingPlanListProps) {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">釣りプラン一覧</h2>
      {plans.length === 0 ? (
        <p className="text-gray-600">お探しの条件に合うプランは見つかりませんでした。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={plan.imageUrl || '/images/default-boat.jpg'}
                  alt={plan.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 truncate">{plan.title}</h3>
                <p className="text-sm text-gray-600 mb-2">エリア: {plan.area}</p>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-blue-600">{plan.price.toLocaleString()}円</p>
                  {/* 詳細リンクや他の要素をここに追加可能 */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
