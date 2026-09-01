import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import ParkingMap from '../../components/parking/ParkingMap.jsx';
import LotCard from '../../components/parking/LotCard.jsx';
import useParkingLots from '../../hooks/useParkingLots.js';
import { ParkingSearchSkeleton } from '../../components/common/SkeletonLoader.jsx';
import useAuth from '../../hooks/useAuth.js';

const ParkingSearchPage = ({ isTab = false }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // TODO: User login/account page must be removed. Redirect commented out.
  /*
  useEffect(() => {
    if (!isTab && isAuthenticated) {
      navigate('/account?tab=parking', { replace: true });
    }
  }, [isTab, isAuthenticated, navigate]);
  */

  const { lots: allLots, loading } = useParkingLots();

  // Commented out: Manaoag Church Lot and Manaoag Public Market Lot (not totally removed, just commented out in UI view)
  /*
  // Commented out lots:
  // - Manaoag Church Lot
  // - Manaoag Public Market Lot
  */
  const lots = useMemo(() => {
    const lccLot = allLots.filter(lot => lot.name === 'LCC Parking');
    return lccLot.length > 0 ? lccLot : allLots;
  }, [allLots]);

  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedSlotType, setSelectedSlotType] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [hoveredLotId, setHoveredLotId] = useState(null);

  const [mapCenter, setMapCenter] = useState({ lat: 16.0450924, lng: 120.4909147 });
  const [searchedPlace, setSearchedPlace] = useState(null);

  // Update map center when a specific lot is searched and found
  useMemo(() => {
    if (searchQuery) {
      const firstMatch = lots.find(lot => 
        lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (firstMatch) {
        const location = { lat: firstMatch.lat, lng: firstMatch.lng };
        setMapCenter(location);
        setSearchedPlace(location);
      }
    } else {
      setSearchedPlace(null);
    }
  }, [searchQuery, lots]);

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

    if (selectedSlotType !== 'all') {
      result = result.filter((lot) => lot.slotTypes && lot.slotTypes.includes(selectedSlotType));
    }

    if (sortBy === 'availability') {
      result.sort((a, b) => (b.availableSlots || 0) - (a.availableSlots || 0));
    }

    return result;
  }, [lots, searchQuery, availableOnly, selectedSlotType, sortBy]);

  if (loading) return <ParkingSearchSkeleton isTab={isTab} />;

  return (
    <div className={isTab ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
      {!isTab && <h1 className="text-2xl font-bold mb-6">Find Parking</h1>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
          {/*
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search Parking.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              Available Now
            </label>
            
            <select
              value={selectedSlotType}
              onChange={(e) => setSelectedSlotType(e.target.value)}
              className="text-sm border border-teal-600 rounded-lg px-2 py-1 max-w-[150px] font-semibold text-teal-700 bg-teal-50/50 hover:bg-teal-50 transition"
            >
              <option value="all">All Types</option>
              <option value="regular">Regular (Recommended)</option>
              <option value="PWD">PWD</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="ev">EV</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 max-w-[120px]"
            >
              <option value="distance">Sort by Dist</option>
              <option value="availability">Sort by Avail</option>
            </select>
          </div>
          */}

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {filteredLots.map((lot) => (
              <LotCard 
                key={lot._id} 
                lot={lot} 
                onMouseEnter={() => setHoveredLotId(lot._id)}
                onMouseLeave={() => setHoveredLotId(null)}
              />
            ))}
            {filteredLots.length === 0 && (
              <p className="text-center text-gray-400 py-8">No lots found</p>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 h-full rounded-xl overflow-hidden border border-gray-200">
          <ParkingMap 
            lots={filteredLots} 
            center={mapCenter} 
            searchedPlace={searchedPlace} 
            hoveredLotId={hoveredLotId}
          />
        </div>
      </div>
    </div>
  );
};

export default ParkingSearchPage;

