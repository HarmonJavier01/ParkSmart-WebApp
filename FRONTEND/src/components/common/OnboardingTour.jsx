import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  CalendarCheck, 
  QrCode, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X 
} from 'lucide-react';

const OnboardingTour = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if the onboarding flag is present in localStorage
    const shouldShow = localStorage.getItem('showOnboarding') === 'true';
    if (shouldShow) {
      setShow(true);
      // Prevent body scroll when tour is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!show) return null;

  const steps = [
    {
      title: "Welcome to ParkSmart! 🚗",
      description: "We are absolutely thrilled to have you! Let's take a quick 1-minute tour to help you make your very first smart parking reservation in Manaoag.",
      icon: Sparkles,
      color: "from-teal-500 to-emerald-400 text-teal-700",
      accentBg: "bg-teal-500/10",
      badge: "Quick Start"
    },
    {
      title: "Real-time Lot Monitoring 📡",
      description: "Browse nearby parking lots and instantly see available spaces in real-time, powered directly by our physical smart IoT sensors.",
      icon: MapPin,
      color: "from-teal-600 to-cyan-500 text-teal-800",
      accentBg: "bg-cyan-500/10",
      badge: "IoT Live Status"
    },
    {
      title: "Instant Space Booking 📅",
      description: "Reserve your ideal parking slot ahead of time! Pick a specific spot, specify your booking duration, and secure it immediately.",
      icon: CalendarCheck,
      color: "from-amber-500 to-orange-400 text-amber-700",
      accentBg: "bg-amber-500/10",
      badge: "Guaranteed Spot"
    },
    {
      title: "Smart QR Ticket Entry 🎫",
      description: "Upon reservation, a digital ticket containing a secure QR code will be generated. Simply present it at the entrance to scan and enter hassle-free!",
      icon: QrCode,
      color: "from-indigo-500 to-purple-400 text-indigo-700",
      accentBg: "bg-indigo-500/10",
      badge: "Seamless Entry"
    },
    {
      title: "You are Ready to Roll! 🎉",
      description: "You've successfully learned the basics of ParkSmart! Let's find your perfect parking slot right now.",
      icon: Car,
      color: "from-teal-500 to-teal-700 text-teal-700",
      accentBg: "bg-teal-700/10",
      badge: "Finished!"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.removeItem('showOnboarding');
    document.body.style.overflow = 'unset';
    setShow(false);
    navigate('/parking');
  };

  const currentStep = steps[step];
  const IconComponent = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-2xl md:max-w-md border border-gray-100 flex flex-col font-outfit">
        
        {/* Sleek Top Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 flex">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-full flex-grow transition-all duration-500 ${
                index <= step ? 'bg-parking-primary' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

        {/* Close/Skip Button */}
        <button 
          onClick={handleComplete}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Box */}
        <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center">
          
          {/* Animated Icon Circle */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md transition-all duration-500 scale-100 hover:scale-105 ${currentStep.accentBg}`}>
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentStep.color} flex items-center justify-center text-white`}>
              <IconComponent className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          {/* Badge */}
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-parking-primary bg-parking-primary/10 rounded-full mb-3">
            {currentStep.badge}
          </span>

          {/* Header Title */}
          <h2 className="text-2xl font-black text-gray-800 tracking-tight transition-all duration-300">
            {currentStep.title}
          </h2>

          {/* Body Description */}
          <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-sm">
            {currentStep.description}
          </p>

          {/* Dots Indicator */}
          <div className="flex gap-2 mt-8 justify-center">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === step ? 'w-6 bg-parking-primary' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Navigation Panel */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-1.5 text-sm font-semibold transition ${
              step === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-parking-primary hover:bg-teal-800 text-white rounded-xl text-sm font-bold shadow-md shadow-parking-primary/20 hover:shadow-lg transition-all"
          >
            {step === steps.length - 1 ? (
              <span>Get Started</span>
            ) : (
              <>
                Next <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
