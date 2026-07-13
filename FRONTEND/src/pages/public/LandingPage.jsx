import { Link } from 'react-router-dom';
import { MapPin, CalendarCheck, Car, ArrowRight, ChevronRight } from 'lucide-react';
import LotCard from '../../components/parking/LotCard.jsx';
import useParkingLots from '../../hooks/useParkingLots.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const LandingPage = () => {
  const { lots, loading } = useParkingLots();

  const stats = [
    { label: 'Parking Lots', value: lots.length, icon: MapPin },
    { label: 'Available Slots', value: lots.reduce((acc, lot) => acc + (lot.availableSlots || 0), 0), icon: Car }
  ];

  return (
    <div>
      {/* Hero */}
      <section 
        className="relative bg-cover bg-center text-white py-24 md:py-36"
        style={{ 
          backgroundImage: "linear-gradient(rgba(5, 54, 48, 0.65), rgba(5, 54, 48, 0.75)), url('/images/backgroundImage.jpg')" 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Find Parking in Manaoag Instantly
          </h1>
          <p className="text-lg md:text-xl text-teal-100 mb-10 max-w-3xl mx-auto font-normal">
            Real-time smart parking with IoT sensors. View available spots before you arrive and skip the hassle of searching.
          </p>
          <Link
            to="/parking"
            className="inline-flex items-center gap-2 bg-white text-teal-900 px-7 py-3.5 rounded-lg font-bold hover:bg-teal-50 transition duration-200 shadow-md hover:shadow-lg"
          >
            Find Parking Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 p-5 bg-[#f8fafc] rounded-xl border border-gray-50">
                <div className="w-12 h-12 bg-[#f1f5f9] text-[#063b31] rounded-lg flex items-center justify-center shrink-0">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <div className="w-12 h-1 bg-parking-primary mx-auto mt-3 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { step: '01', title: 'Find', desc: 'Browse parking lots near you with real-time availability using our intuitive map interface.' },
              { step: '02', title: 'Park', desc: 'Arrive at the location and park hassle-free in any of the open/available spots.' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-[#063b31] text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 max-w-sm mx-auto text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lots */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Parking Areas</h2>
              <p className="text-sm text-gray-500 mt-1">Top-rated and most convenient locations in Manaoag</p>
            </div>
            <Link 
              to="/parking" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#063b31] hover:text-teal-800 mt-2 md:mt-0 transition duration-200"
            >
              View All Locations
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lots.slice(0, 3).map((lot) => (
                <LotCard key={lot._id} lot={lot} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

