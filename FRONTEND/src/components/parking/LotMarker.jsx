import { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

const LotMarker = ({ lot, isHovered }) => {
  const navigate = useNavigate();
  const [isLocalHovered, setIsLocalHovered] = useState(false);
  const available = lot.availableSlots || 0;

  const markerColor = available > 0 ? '#22c55e' : '#ef4444';

  const markerIcon = {
    path: window.google ? window.google.maps.SymbolPath.CIRCLE : 0,
    fillColor: markerColor,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 14
  };

  const markerLabel = {
    text: String(available),
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 'bold'
  };

  // Show InfoWindow if hovered from sidebar list OR hovered directly on the map marker
  const showInfoWindow = isHovered || isLocalHovered;

  return (
    <Marker
      position={{ lat: lot.lat, lng: lot.lng }}
      icon={markerIcon}
      label={markerLabel}
      onMouseOver={() => setIsLocalHovered(true)}
      onMouseOut={() => setIsLocalHovered(false)}
      onClick={() => navigate(`/parking/${lot._id}`)}
    >
      {showInfoWindow && (
        <InfoWindow 
          options={{ 
            disableAutoPan: false,
            pixelOffset: window.google ? new window.google.maps.Size(0, -10) : null
          }}
        >
          {/* Custom styled card exactly matching the Google Maps UI in the screenshot */}
          <div className="w-64 bg-white rounded-xl overflow-hidden flex flex-col font-outfit text-left shadow-lg -m-2">
            
            {/* Cover photo */}
            <div className="h-28 w-full relative overflow-hidden bg-gray-900">
              <img 
                src={lot.imageUrl || "/images/IMG20260604134124.jpg"} 
                alt={lot.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Details panel */}
            <div className="p-3 flex items-center justify-between gap-2.5">
              <div className="flex flex-col text-left">
                <h4 className="font-black text-gray-800 text-sm leading-snug truncate max-w-[155px]" title={lot.name}>
                  {lot.name}
                </h4>
                
                {/* Rating details */}
                <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-500">
                  <span className="font-bold">{lot.rating?.toFixed(1) || '5.0'}</span>
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3 h-3 fill-current shrink-0" />
                  </div>
                  <span className="text-gray-400 font-semibold">({lot.ratingCount || 0})</span>
                </div>
                
                <span className="text-[9px] font-bold text-teal-600 bg-teal-50/70 border border-teal-100/50 px-1.5 py-0.5 rounded mt-1.5 inline-block w-max">
                  Public parking space
                </span>
              </div>

              {/* Circle action buttons (Directions & Save) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Routing directions to ${lot.name}...`);
                  }}
                  className="w-7.5 h-7.5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition shadow-sm border border-teal-100/20"
                  title="Directions"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.43 11.23L12.77 1.57a2.5 2.5 0 00-3.54 0L1.57 9.23a2.5 2.5 0 000 3.54l9.66 9.66c.97.97 2.56.97 3.53 0l7.67-7.66a2.5 2.5 0 000-3.54zM14 14.5V12h-4v3H8.5v-4.5A1.5 1.5 0 0110 9h4V6.5l3.5 3.5-3.5 3.5z"/>
                  </svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Saved to your bookmarks!');
                  }}
                  className="w-7.5 h-7.5 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-gray-50 hover:text-gray-600 transition shadow-sm"
                  title="Save"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>
            
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
};

export default LotMarker;
