import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Banknote, ArrowLeft, Star, 
  Share2, Bookmark, Map, Smartphone, Heart, 
  Camera, ThumbsUp, X, ChevronLeft, ChevronRight,
  MessageSquare, CheckCircle, Info, ExternalLink
} from 'lucide-react';
import SlotGrid from '../../components/parking/SlotGrid.jsx';
import useSlots from '../../hooks/useSlots.js';
import lotService from '../../services/lotService.js';
import reviewService from '../../services/reviewService.js';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ParkingMap from '../../components/parking/ParkingMap.jsx';
import useAuth from '../../hooks/useAuth.js';

const LotDetailPage = () => {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [lot, setLot] = useState(null);
  const { slots, loading: slotsLoading } = useSlots(lotId);
  const [loading, setLoading] = useState(true);
  
  // Review & tabs state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews'
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    rating: 5.0,
    ratingCount: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest' | 'lowest'

  // Write review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [newFeedback, setNewFeedback] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Lightbox photo viewer state
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await reviewService.getReviewsByLot(lotId);
      setReviewsData(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchLot = async () => {
      try {
        const data = await lotService.getLotById(lotId);
        setLot(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLot();
    fetchReviews();
  }, [lotId]);

  const handleSlotClick = (slot) => {
    if (slot.status === 'available') {
      navigate(`/reserve/${slot._id}?lotId=${lotId}`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newRating) return;
    try {
      setIsSubmittingReview(true);
      const response = await reviewService.createReview(lotId, {
        rating: newRating,
        feedback: newFeedback
      });
      showToast(response.message || 'Review saved!');
      
      // Refresh reviews and lot metadata (rating / ratingCount)
      await fetchReviews();
      const updatedLot = await lotService.getLotById(lotId);
      setLot(updatedLot);
      
      // Close modal
      setShowReviewModal(false);
      setNewRating(5);
      setNewFeedback('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper to format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return `${diffYears} years ago`;
  };

  // Helper to render stars
  const renderStars = (score, size = 16, className = "text-amber-400 fill-amber-400") => {
    const stars = [];
    const floorRating = Math.floor(score);
    const hasHalf = score % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} size={size} className={className} />);
      } else if (i === floorRating + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative inline-block leading-none">
            <Star size={size} className="text-gray-200" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2 h-full">
              <Star size={size} className={className} />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={size} className="text-gray-200" />);
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Sort reviews
  const sortedReviews = [...reviewsData.reviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    return 0;
  });

  if (loading || slotsLoading) return <LoadingSpinner fullScreen />;
  if (!lot) return <div className="text-center py-20 font-outfit text-gray-500">Lot not found</div>;

  // Image list fallback
  const lotImages = lot.images && lot.images.length > 0 
    ? lot.images 
    : [lot.imageUrl || "/images/IMG20260604134124.jpg"];

  // Calculate percentage breakdown for reviews
  const totalR = reviewsData.ratingCount || 1;
  const ratingPercentages = {
    5: Math.round(((reviewsData.breakdown?.[5] || 0) / totalR) * 100),
    4: Math.round(((reviewsData.breakdown?.[4] || 0) / totalR) * 100),
    3: Math.round(((reviewsData.breakdown?.[3] || 0) / totalR) * 100),
    2: Math.round(((reviewsData.breakdown?.[2] || 0) / totalR) * 100),
    1: Math.round(((reviewsData.breakdown?.[1] || 0) / totalR) * 100)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-outfit">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-teal-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce border border-teal-500">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <button
        onClick={() => navigate('/parking')}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 transition font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Slots Grid */}
        <div className="lg:col-span-2 space-y-6">
          <SlotGrid
            slots={slots}
            onSlotClick={handleSlotClick}
            title={`Slots (${lot.availableSlots || 0} available)`}
          />
          <p className="text-sm text-gray-400 text-center bg-gray-50/50 py-3 rounded-xl border border-dashed border-gray-100">
            Click on a green (available) slot to reserve it.
          </p>

          {/* Interactive Google Map below the Slot Grid */}
          <div className="card shadow-lg border border-gray-100/50 p-3 bg-white rounded-2xl h-[380px] overflow-hidden relative">
            <div className="absolute top-5 left-5 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-parking-primary" />
              <span className="text-xs font-bold text-gray-800">Interactive Location Map</span>
            </div>
            <ParkingMap lots={[lot]} slots={slots} center={{ lat: lot.lat, lng: lot.lng }} zoom={20} />
          </div>
        </div>

        {/* Right Section: Google Map Style Details Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card shadow-xl border border-gray-100 bg-white rounded-3xl overflow-hidden flex flex-col">
            
            {/* 1. Cover Photo Panel */}
            <div className="h-48 relative w-full overflow-hidden bg-gray-900 group">
              <img 
                src={lot.imageUrl || "/images/IMG20260604134124.jpg"} 
                alt={lot.name} 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Photo count badge */}
              <button 
                onClick={() => setActivePhotoIndex(0)}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{lotImages.length} Photos</span>
              </button>
            </div>

            {/* 2. Lot Header Info */}
            <div className="p-6 pb-4">
              <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-tight mb-1">{lot.name}</h1>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-amber-500">{lot.rating?.toFixed(1) || '5.0'}</span>
                {renderStars(lot.rating || 5.0, 14)}
                <span className="text-xs text-gray-400 font-semibold">({lot.ratingCount || 0} reviews)</span>
              </div>
              <p className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md inline-block">
                Public parking space
              </p>
            </div>

            {/* 3. Google Maps Tabs (Overview vs Reviews) */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 text-center py-3.5 text-sm font-bold border-b-2 transition ${
                  activeTab === 'overview' 
                    ? 'border-teal-500 text-teal-600' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 text-center py-3.5 text-sm font-bold border-b-2 transition ${
                  activeTab === 'reviews' 
                    ? 'border-teal-500 text-teal-600' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Reviews
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 max-h-[550px] overflow-y-auto space-y-6">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && (
                <>
                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-5 gap-1.5 text-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <button 
                      onClick={() => showToast('Simulating route navigation to parking lot...')} 
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center transition group-hover:scale-105 active:scale-95">
                        <Map className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-teal-600">Directions</span>
                    </button>
                    <button 
                      onClick={() => showToast('Saved to your bookmarks!')} 
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center transition group-hover:scale-105 active:scale-95">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-teal-600">Save</span>
                    </button>
                    <button 
                      onClick={() => showToast('Searching for nearby attractions...')} 
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center transition group-hover:scale-105 active:scale-95">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-teal-600">Nearby</span>
                    </button>
                    <button 
                      onClick={() => showToast('Parking details sent to registered phone number!')} 
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center transition group-hover:scale-105 active:scale-95">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-teal-600">Send phone</span>
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Link copied to clipboard!');
                      }} 
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center transition group-hover:scale-105 active:scale-95">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover:text-teal-600">Share</span>
                    </button>
                  </div>

                  {/* Informational list */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5 text-sm text-gray-600 leading-relaxed">
                      <MapPin className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800">{lot.address}</p>
                        <span className="text-xs text-gray-400">Manaoag, Pangasinan</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 text-sm text-gray-600">
                      <Clock className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {lot.operatingHours?.open} - {lot.operatingHours?.close}
                        </p>
                        <span className="text-xs text-green-500 font-bold">Open Daily</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 text-sm text-gray-600">
                      <Banknote className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-teal-600">₱{lot.ratePerHour}/hr</p>
                        <span className="text-xs text-gray-400">Regular parking rate</span>
                      </div>
                    </div>
                    
                    <hr className="border-gray-100 my-4" />

                    <div className="flex items-center justify-between text-xs text-gray-400 font-bold bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
                      <span className="flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-gray-400" />
                        Claim this business
                      </span>
                      <button onClick={() => showToast('Feature available for business owners.')} className="text-teal-600 hover:underline flex items-center gap-0.5">
                        Claim <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Photos Grid Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center justify-between">
                      <span>Photos & videos</span>
                      <span className="text-xs font-semibold text-teal-600">{lotImages.length} available</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {lotImages.slice(0, 3).map((img, i) => (
                        <div 
                          key={i} 
                          onClick={() => setActivePhotoIndex(i)}
                          className="h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-100 cursor-pointer relative group"
                        >
                          <img src={img} alt="Lot detail" className="w-full h-full object-cover transition group-hover:scale-105" />
                          {i === 2 && lotImages.length > 3 && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                              +{lotImages.length - 3}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-black text-gray-800 tracking-tight">Review summary</h3>
                    
                    <div className="flex gap-6 items-center">
                      <div className="text-center shrink-0">
                        <p className="text-4xl font-black text-gray-800 leading-none mb-1">
                          {lot.rating?.toFixed(1) || '5.0'}
                        </p>
                        <div className="mb-1">{renderStars(lot.rating || 5.0, 12, "text-amber-400 fill-amber-400 justify-center")}</div>
                        <span className="text-xs text-gray-400 font-semibold">{lot.ratingCount || 0} reviews</span>
                      </div>

                      {/* Bar charts distribution */}
                      <div className="flex-grow space-y-1.5">
                        {[5, 4, 3, 2, 1].map(stars => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 w-3 text-right">{stars}</span>
                            <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${ratingPercentages[stars]}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 w-6">
                              {ratingPercentages[stars]}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            showToast('Please log in to write a review');
                            navigate('/account');
                          } else {
                            setShowReviewModal(true);
                          }
                        }}
                        className="flex-1 text-center py-2.5 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200/50 text-teal-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Write a review
                      </button>
                    </div>
                  </div>

                  {/* Overview Preview Reviews */}
                  {reviewsData.reviews.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-sm font-black text-gray-800 tracking-tight">Recent Feedback</h3>
                      <div className="space-y-3">
                        {reviewsData.reviews.slice(0, 2).map((rev) => (
                          <div key={rev._id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700">{rev.userId?.name || 'Anonymous User'}</span>
                              <span className="text-[10px] text-gray-400">{formatRelativeTime(rev.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {renderStars(rev.rating, 10)}
                            </div>
                            {rev.feedback && (
                              <p className="text-xs text-gray-500 italic font-medium leading-relaxed">
                                "{rev.feedback}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* --- REVIEWS TAB --- */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews actions header */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-500 font-bold">Sort by:</span>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="newest">Newest</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          showToast('Please log in to write a review');
                          navigate('/account');
                        } else {
                          setShowReviewModal(true);
                        }
                      }}
                      className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Add Review
                    </button>
                  </div>

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="py-8 text-center text-xs text-gray-400 font-semibold animate-pulse">Loading reviews…</div>
                  ) : sortedReviews.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-400">
                      No reviews yet. Be the first to write a review!
                    </div>
                  ) : (
                    <div className="space-y-5 divide-y divide-gray-50">
                      {sortedReviews.map((rev, index) => {
                        const userInitial = rev.userId?.name ? rev.userId.name.charAt(0).toUpperCase() : 'U';
                        // Dynamic color list for avatars
                        const colors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-emerald-500'];
                        const colorClass = colors[index % colors.length];

                        return (
                          <div key={rev._id} className={`pt-4 ${index === 0 ? 'pt-0' : ''} space-y-2.5`}>
                            <div className="flex items-center gap-2.5">
                              {/* Custom user avatar */}
                              <div className={`w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-sm shadow-inner`}>
                                {userInitial}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-gray-800 tracking-tight leading-none mb-0.5">
                                  {rev.userId?.name || 'Anonymous User'}
                                </h4>
                                <div className="flex items-center gap-1.5">
                                  {renderStars(rev.rating, 10)}
                                  <span className="text-[10px] text-gray-400 font-semibold">• {formatRelativeTime(rev.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {rev.feedback && (
                              <p className="text-xs text-gray-600 leading-relaxed font-medium pl-10">
                                {rev.feedback}
                              </p>
                            )}

                            {/* Likes and actions */}
                            <div className="flex items-center gap-4 pl-10 text-[10px] text-gray-400 font-bold pt-1">
                              <button 
                                onClick={() => showToast('Thank you for your feedback!')}
                                className="flex items-center gap-1 hover:text-teal-600 transition"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>Helpful</span>
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`Review of ${lot.name}: "${rev.feedback}"`);
                                  showToast('Review text copied!');
                                }}
                                className="hover:text-teal-600 transition"
                              >
                                Share
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- WRITE REVIEW MODAL DIALOG --- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-black text-gray-800 tracking-tight mb-1">Write a Review</h3>
            <p className="text-xs text-gray-400 font-medium mb-6">Share your parking experience at {lot.name}</p>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              
              {/* Star selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition duration-150 transform hover:scale-125"
                    >
                      <Star 
                        size={32} 
                        className={`transition-colors duration-150 ${
                          star <= (hoverRating || newRating) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-200 fill-transparent'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-teal-600 font-bold block mt-1">
                  {newRating === 5 && 'Excellent - 5 Stars'}
                  {newRating === 4 && 'Good - 4 Stars'}
                  {newRating === 3 && 'Average - 3 Stars'}
                  {newRating === 2 && 'Poor - 2 Stars'}
                  {newRating === 1 && 'Terrible - 1 Star'}
                </span>
              </div>

              {/* Feedback text area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Your Feedback</label>
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Tell us about slot availability, rates, cleanliness, security, or ease of reservation..."
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder:text-gray-300 font-medium"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-2xl text-sm transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX PHOTO VIEWER OVERLAY --- */}
      {activePhotoIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition bg-white/10 hover:bg-white/20 p-2.5 rounded-full"
            title="Close Gallery"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous image */}
          {lotImages.length > 1 && (
            <button 
              onClick={() => setActivePhotoIndex((prev) => (prev === 0 ? lotImages.length - 1 : prev - 1))}
              className="absolute left-6 text-white/70 hover:text-white transition bg-white/10 hover:bg-white/20 p-3 rounded-full"
              title="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Active Image */}
          <div className="max-w-4xl max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/10">
            <img 
              src={lotImages[activePhotoIndex]} 
              alt={`Gallery View ${activePhotoIndex + 1}`} 
              className="max-w-full max-h-[75vh] object-contain"
            />
          </div>

          {/* Next image */}
          {lotImages.length > 1 && (
            <button 
              onClick={() => setActivePhotoIndex((prev) => (prev === lotImages.length - 1 ? 0 : prev + 1))}
              className="absolute right-6 text-white/70 hover:text-white transition bg-white/10 hover:bg-white/20 p-3 rounded-full"
              title="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Bottom stats details */}
          <div className="absolute bottom-6 text-center text-white/70 font-semibold text-sm">
            <p className="font-bold text-white mb-0.5">{lot.name}</p>
            <span>Photo {activePhotoIndex + 1} of {lotImages.length}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default LotDetailPage;
