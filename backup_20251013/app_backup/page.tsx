'use client';

import FishingPlanList from '../components/FishingPlanList';
import SearchFilter from '../components/SearchFilter';
import { useState, useEffect } from 'react';
import { FishingPlan, Filter } from '@/FishingPlan';

const areaOptions = ['三浦半島', 'lluminate山', '金沢八景'];
const fishTypeOptions = ['マダイ', 'イサキ', 'アジ', 'サバ', 'シーバス', 'タチウオ'];
const minPrice = 0;
const maxPrice = 20000;

export default function Home() {
  const [plans, setPlans] = useState<FishingPlan[]>([]);
  const [filters, setFilters] = useState<Filter>({
    area: '',
    fishType: '',
    minPrice,
    maxPrice,
  });

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => setPlans(data));
  }, []);

  const handleFilterChange = (newFilters: Partial<Filter>) => {
    setFilters((prevFilters: Filter) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  const filteredPlans = (plans: FishingPlan[]): FishingPlan[] => {
    return plans.filter((plan: FishingPlan) => {
      const areaMatch = !filters.area || plan.area === filters.area;
      const fishMatch = !filters.fishType || plan.fishTypes.includes(filters.fishType);
      const priceMatch = plan.price >= filters.minPrice && plan.price <= filters.maxPrice;
      return areaMatch && fishMatch && priceMatch;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <SearchFilter
            areaOptions={areaOptions}
            fishTypeOptions={fishTypeOptions}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className="md:col-span-9">
          <FishingPlanList plans={filteredPlans(plans)} />
        </div>
      </div>
    </div>
  );
}