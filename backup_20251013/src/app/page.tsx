'use client';

import FishingPlanList from '../../components/FishingPlanList';
import Link from 'next/link';
import SearchFilter from '../../components/SearchFilter';
import { useState, useEffect } from 'react';
import type { FishingPlan } from '../types';

// plansから動的にエリア一覧を生成
// const areaOptions = ['三浦半島', 'lluminate山', '金沢八景'];
// 魚種・釣り船名をplansから動的に生成
const fishTypeOptions: string[] = [];
const minPrice = 0;
const maxPrice = 20000;

export default function Home() {
  const [plans, setPlans] = useState<FishingPlan[]>([]);
  const [filters, setFilters] = useState({
    fishType: '',
    date: '',
    boatName: '',
  });

  useEffect(() => {
    const fetchPlans = async () =>
    {
      try
      {
        const res = await fetch( '/api/plans' );
        if ( !res.ok )
        {
          throw new Error( `Failed to fetch plans: ${ res.statusText }` );
        }
        const data = await res.json();
        setPlans( data );
      } catch ( error ) {
        console.error( 'Error fetching fishing plans:', error );
      }
    };
    fetchPlans();
  }, []);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  // 動的に魚種・釣り船名の選択肢を生成
  const fishTypeOptions = Array.from(new Set(plans.flatMap(plan => plan.fishTypes).filter(Boolean)));
  const boatNameOptions = Array.from(new Set(plans.map(plan => plan.title).filter(Boolean)));

  const filteredPlans = (plans: FishingPlan[]): FishingPlan[] => {
    return plans.filter((plan: FishingPlan) => {
      const fishMatch = !filters.fishType || (Array.isArray(plan.fishTypes) && plan.fishTypes.includes(filters.fishType));
      // 日付・釣り船名のフィルタ（現状は日付はダミー、釣り船名はtitle一致）
      const boatMatch = !filters.boatName || plan.title === filters.boatName;
      return fishMatch && boatMatch;
    });
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">釣りプランを探す</h1>
        <Link href="/add-plan">
          <span className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
            新規プランを追加
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-3">
          <div className="sticky top-8">
            <SearchFilter fishTypeOptions={fishTypeOptions} boatNameOptions={boatNameOptions} onFilterChange={handleFilterChange} />
          </div>
        </aside>
        <main className="md:col-span-9">
          <FishingPlanList plans={filteredPlans(plans)} />
        </main>
      </div>
    </div>
  );
}