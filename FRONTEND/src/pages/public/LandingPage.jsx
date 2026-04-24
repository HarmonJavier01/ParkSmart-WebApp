import { Link } from 'react-router-dom';
import { MapPin, CalendarCheck, Car, ArrowRight } from 'lucide-react';
import LotCard from '../../components/parking/LotCard.jsx';
import useParkingLots from '../../hooks/useParkingLots.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const LandingPage = () => {
  const { lots, loading } = useParkingLots();

  const stats = [
    { label: 'Parking Lots', value: lots.length, icon: MapPin },
    { label: 'Available Slots', value: lots.reduce((acc, lot) => acc + (lot.availableSlots || 0), 0), icon: Car },
    { label: 'Reservations Today', value: '120+', icon: CalendarCheck }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 to-teal-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Parking in Manaoag Instantly
          </h1>
          <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Real-time smart parking with IoT sensors. Reserve your spot before you arrive.
          </p>
          <Link
            to="/parking"
            className="inline-flex items-center gap-2 bg-white text-teal-800 px-6 py-3 rounded-lg font-bold hover:bg-teal-50 transition"
          >
            Find Parking Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-center gap-4 p-4">
                <stat.icon className="w-8 h-8 text-parking-primary" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Find', desc: 'Browse parking lots near you with real-time availability.' },
              { step: '02', title: 'Reserve', desc: 'Select a slot, pick your time, and pay the fee.' },
              { step: '03', title: 'Park', desc: 'Show your QR ticket at the entrance and park hassle-free.' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-parking-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lots */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Parking Areas</h2>
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

