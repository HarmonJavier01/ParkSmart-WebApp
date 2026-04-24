import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ParkingMap from '../../components/parking/ParkingMap.jsx';
import LotCard from '../../components/parking/LotCard.jsx';
import useParkingLots from '../../hooks/useParkingLots.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const ParkingSearchPage = () => {
  const { lots, loading } = useParkingLots();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');

  const filteredLots = useMemo(() => {
    let result = [...lots];

    if (searchQuery) {
      result = result.filter((lot) =>
        lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (availableOnly) {
      result = result.filter((lot) => (lot.availableSlots || 0) > 0);
    }

    if (sortBy === 'availability') {
      result.sort((a, b) => (b.availableSlots || 0) - (a.availableSlots || 0));
    }

    return result;
  }, [lots, searchQuery, availableOnly, sortBy]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Find Parking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              Available Now
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1"
            >
              <option value="distance">Sort by Distance</option>
              <option value="availability">Sort by Availability</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {filteredLots.map((lot) => (
              <LotCard key={lot._id} lot={lot} />
            ))}
            {filteredLots.length === 0 && (
              <p className="text-center text-gray-400 py-8">No lots found</p>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 h-full rounded-xl overflow-hidden border border-gray-200">
          <ParkingMap lots={filteredLots} />
        </div>
      </div>
    </div>
  );
};

export default ParkingSearchPage;

