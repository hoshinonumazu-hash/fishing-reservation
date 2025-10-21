"use client";
import * as React from 'react';

interface SearchFilterProps {
  fishTypeOptions: string[];
  boatNameOptions: string[];
  onFilterChange: (filters: {
    fishType: string;
    date: string;
    boatName: string;
  }) => void;
}

export default function SearchFilter(props: SearchFilterProps) {
  const { fishTypeOptions = [], boatNameOptions = [], onFilterChange } = props;
  const [fishType, setFishType] = React.useState('');
  const [date, setDate] = React.useState('');
  const [boatName, setBoatName] = React.useState('');

  React.useEffect(() => {
    onFilterChange({ fishType, date, boatName });
  }, [fishType, date, boatName]);

  return (
    <aside className="w-full md:w-64 bg-white rounded-lg shadow-md p-4 mb-6 md:mb-0">
      <h3 className="text-lg font-bold mb-4">検索フィルター</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">魚種</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={fishType}
          onChange={e => setFishType(e.target.value)}
        >
          <option value="">すべて</option>
          {fishTypeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">日付</label>
        <input
          type="date"
          className="w-full border rounded px-2 py-1"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">釣り船名</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={boatName}
          onChange={e => setBoatName(e.target.value)}
        >
          <option value="">すべて</option>
          {boatNameOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">魚種</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={fishType}
          onChange={e => setFishType(e.target.value)}
        >
          <option value="">すべて</option>
          {fishTypeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </aside>
  );
}
