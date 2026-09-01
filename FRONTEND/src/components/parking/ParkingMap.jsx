import { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Circle, useJsApiLoader, Polygon, InfoWindow } from '@react-google-maps/api';
import { Compass, Navigation, Eye, MapPin, Layers } from 'lucide-react';
import LotMarker from './LotMarker.jsx';
import SlotMarker from './SlotMarker.jsx';
import { manaoagBoundary } from '../../constants/manaoagBoundary.js';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
  position: 'relative'
};

const userBlueDotIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
    <circle cx="17" cy="17" r="14" fill="#4285F4" fill-opacity="0.25" />
    <circle cx="17" cy="17" r="8" fill="#FFFFFF" />
    <circle cx="17" cy="17" r="6" fill="#4285F4" />
  </svg>
`)}`;

// Helper to calculate center of boundary polygon
const getPolygonCenter = (coords) => {
  if (!coords || coords.length === 0) return null;
  const sum = coords.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
};

// Compound boundary polygon coordinates center
const boundaryCenter = getPolygonCenter(manaoagBoundary) || { lat: 16.04507, lng: 120.49125 };

// Exact custom GPS layout map matching the physical satellite lot arrangement in the diagram
const LCC_SLOT_COORDINATES = {
  // Bottom section: slots 1 to 5 (right column) & slots 6 to 10 (left column) near Milo St entrance
  1: { lat: 16.04447, lng: 120.49131 },
  2: { lat: 16.04452, lng: 120.49131 },
  3: { lat: 16.04457, lng: 120.49131 },
  4: { lat: 16.04462, lng: 120.49131 },
  5: { lat: 16.04467, lng: 120.49131 },
  6: { lat: 16.04447, lng: 120.49124 },
  7: { lat: 16.04452, lng: 120.49124 },
  8: { lat: 16.04457, lng: 120.49124 },
  9: { lat: 16.04462, lng: 120.49124 },
  10: { lat: 16.04467, lng: 120.49124 },

  // Middle-south section (south of green roof building): slots 11 to 16
  11: { lat: 16.04473, lng: 120.49130 },
  12: { lat: 16.04480, lng: 120.49130 },
  13: { lat: 16.04487, lng: 120.49130 },
  14: { lat: 16.04494, lng: 120.49130 },
  15: { lat: 16.04501, lng: 120.49130 },
  16: { lat: 16.04508, lng: 120.49130 },

  // Middle-north section (north of green roof building): slots 17 to 18
  17: { lat: 16.04543, lng: 120.49128 },
  18: { lat: 16.04550, lng: 120.49128 },

  // Top-left section (north-west driveway): slots 19 to 25
  19: { lat: 16.04530, lng: 120.49114 },
  20: { lat: 16.04536, lng: 120.49114 },
  21: { lat: 16.04542, lng: 120.49114 },
  22: { lat: 16.04548, lng: 120.49114 },
  23: { lat: 16.04554, lng: 120.49114 },
  24: { lat: 16.04560, lng: 120.49114 },
  25: { lat: 16.04566, lng: 120.49114 }
};

// Helper to calculate coordinate of each slot inside a parking row line
const getSlotCoordinates = (lot, slot, index, totalSlots) => {
  const isLCC = lot?.name && (lot.name.includes("Los Caballeros") || lot.name.includes("LCC"));

  if (isLCC) {
    let slotNum = index + 1;
    if (slot?.slotNumber) {
      const match = String(slot.slotNumber).match(/\d+/);
      if (match) slotNum = parseInt(match[0], 10);
    }
    if (LCC_SLOT_COORDINATES[slotNum]) {
      return LCC_SLOT_COORDINATES[slotNum];
    }
  }

  let latSpacing = 0.000006;
  let lngSpacing = 0.000018;

  const baseLat = isLCC ? boundaryCenter.lat : (lot?.lat || boundaryCenter.lat);
  const baseLng = isLCC ? boundaryCenter.lng : (lot?.lng || boundaryCenter.lng);

  if (lot?.name && lot.name.includes("Church")) {
    latSpacing = 0.000010;
    lngSpacing = 0.000004;
  } else if (lot?.name && lot.name.includes("Market")) {
    latSpacing = 0.000002;
    lngSpacing = 0.000015;
  }

  const startLatOffset = -((totalSlots - 1) / 2) * latSpacing;
  const startLngOffset = -((totalSlots - 1) / 2) * lngSpacing;

  return {
    lat: baseLat + startLatOffset + (index * latSpacing),
    lng: baseLng + startLngOffset + (index * lngSpacing)
  };
};
const ParkingMap = ({ lots, slots = null, center = { lat: 16.04507, lng: 120.49125 }, zoom = 15, searchedPlace = null, hoveredLotId = null }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [mapTypeId, setMapTypeId] = useState('hybrid');
  
  const watchIdRef = useRef(null);

  // Fetch user location automatically on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation initial load error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Clean up location tracking on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  // Handle device orientation to rotate the map
  const handleOrientation = (event) => {
    if (!map) return;

    let heading = 0;
    // iOS Safari
    if (event.webkitCompassHeading !== undefined) {
      heading = event.webkitCompassHeading;
    }
    // Android / Standard absolute orientation
    else if (event.alpha !== undefined) {
      heading = 360 - event.alpha;
    }

    // Apply rotation to Google Map dynamically
    map.setHeading(heading);
  };

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Geolocation & Compass Navigation Toggle
  const toggleNavigationMode = async () => {
    if (!map) return;

    if (isNavigating) {
      // Turn off navigation mode
      setIsNavigating(false);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      
      // Reset map view to standard top-down north-aligned
      map.setHeading(0);
      map.setTilt(0);
      setIs3D(false);
    } else {
      // Turn on navigation mode
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }

      setIsNavigating(true);

      // 1. Center on user location and watch positions
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPos(pos);
          map.panTo(pos);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // 2. Set Map to 3D Navigation tilt (45 degrees)
      map.setTilt(45);
      setIs3D(true);

      // 3. Request iOS DeviceOrientation permissions if needed, then listen for orientation
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            console.warn('Device orientation permission denied');
          }
        } catch (e) {
          console.error('Error requesting orientation permission:', e);
        }
      } else {
        // Android or non-iOS browsers
        if ('ondeviceorientationabsolute' in window) {
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      }
    }
  };

  // Toggle between Roadmap, Terrain, and Hybrid map types
  const toggleMapType = () => {
    if (mapTypeId === 'roadmap') setMapTypeId('terrain');
    else if (mapTypeId === 'terrain') setMapTypeId('hybrid');
    else setMapTypeId('roadmap');
  };

  // Manual 3D Tilt Toggle
  const toggle3D = () => {
    if (!map) return;
    const new3D = !is3D;
    setIs3D(new3D);
    map.setTilt(new3D ? 45 : 0);
  };

  if (loadError) {
    return (
      <div className="w-full h-full rounded-xl flex items-center justify-center bg-gray-100 text-red-500">
        <p>Error loading Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-xl flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-outfit">Loading map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        mapTypeId={mapTypeId}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          rotateControl: true,
          tiltControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy', // Fluid multi-touch navigation
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {/* Draw the administrative boundary polygon outline of Manaoag, Pangasinan */}
        {manaoagBoundary && manaoagBoundary.length > 0 && (
          <Polygon
            paths={manaoagBoundary}
            options={{
              strokeColor: '#0f766e',
              strokeOpacity: 0.8,
              strokeWeight: 3.5,
              fillColor: '#0f766e',
              fillOpacity: 0.06,
              clickable: false,
              zIndex: 1
            }}
          />
        )}
        {/* Draw circle boundary scope for every parking lot on the map */}
        {lots.map((lot) => {
          const isLCC = lot?.name && (lot.name.includes("Los Caballeros") || lot.name.includes("LCC"));
          const circleCenter = isLCC ? boundaryCenter : { lat: lot.lat || boundaryCenter.lat, lng: lot.lng || boundaryCenter.lng };
          return (
            <Circle
              key={`boundary-${lot._id}`}
              center={circleCenter}
              radius={lots.length === 1 ? 42 : 50} // Centered right on the boundary box
              options={{
                strokeColor: '#0d9488',
                strokeOpacity: 0.7,
                strokeWeight: 2,
                fillColor: '#0d9488',
                fillOpacity: 0.1,
                clickable: false,
                zIndex: -1
              }}
            />
          );
        })}

        {slots && slots.length > 0 ? (
          // Slot-level detail view: render individual slots as red/green circular markers in the custom layout
          slots.map((slot, index) => {
            const pos = getSlotCoordinates(lots[0], slot, index, slots.length);
            return (
              <SlotMarker
                key={slot._id || index}
                slot={slot}
                position={pos}
              />
            );
          })
        ) : (
          // General view: render standard lot markers
          lots.map((lot) => (
            <LotMarker 
              key={lot._id} 
              lot={lot} 
              isHovered={hoveredLotId === lot._id}
              onGetDirections={() => {
                setShowRoute(true);
                if (map) {
                  map.panTo({ lat: lot.lat, lng: lot.lng });
                }
              }}
            />
          ))
        )}
        
        {/* Searched Place Marker */}
        {searchedPlace && (
          <Marker
            position={searchedPlace}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: { width: 40, height: 40 }
            }}
            animation={1} // Animation.DROP fallback literal
          />
        )}

        {/* User Geolocation Pulse Marker */}
        {userPos && (
          <>
            <Marker
              position={userPos}
              icon={{
                url: userBlueDotIcon,
                scaledSize: { width: 34, height: 34 },
                anchor: new window.google.maps.Point(17, 17)
              }}
            />
            {isNavigating && (
              <InfoWindow
                position={userPos}
                options={{
                  pixelOffset: new window.google.maps.Size(0, -20),
                  disableAutoPan: true
                }}
              >
                <div className="px-2 py-0.5 font-outfit text-[10px] font-bold text-gray-700 bg-white rounded-md shadow-sm border border-gray-100">
                  Your location
                </div>
              </InfoWindow>
            )}
          </>
        )}

      </GoogleMap>

      {/* Premium Floating Navigation & Perspective HUD Panel */}
      <div className="absolute bottom-6 right-16 z-10 flex flex-col gap-3">
        {/* Toggle Map Type button */}
        <button
          onClick={toggleMapType}
          title="Change Map Style (Roadmap / Terrain / Hybrid)"
          className="relative w-12 h-12 bg-white/95 backdrop-blur shadow-lg border border-gray-100 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 text-gray-600 hover:text-gray-800"
        >
          <Layers className="w-5 h-5" />
          <span className="absolute -top-1.5 -right-1.5 text-[7px] font-extrabold px-1 py-0.5 rounded-full bg-teal-600 text-white uppercase tracking-tighter leading-none scale-90">
            {mapTypeId === 'hybrid' ? 'Sat' : mapTypeId === 'terrain' ? 'Terr' : 'Map'}
          </span>
        </button>

        {/* Toggle 2D / 3D Tilt button */}
        {/* <button
          onClick={toggle3D}
          title="Toggle 2D / 3D Tilt View"
          className={`w-12 h-12 bg-white/95 backdrop-blur shadow-lg border border-gray-100 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
            is3D ? 'text-parking-primary border-parking-primary/30 bg-teal-50' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1 py-0.5 rounded-full bg-teal-500 text-white leading-none">
            {is3D ? '3D' : '2D'}
          </span>
        </button> */}



        {/* Dynamic Orientation Compass Navigation button */}
        <button
          onClick={toggleNavigationMode}
          title="Toggle Rotation Compass Navigation"
          className={`relative w-12 h-12 bg-white/95 backdrop-blur shadow-lg border border-gray-100 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
            isNavigating 
              ? 'text-parking-primary border-parking-primary/30 bg-teal-50 animate-pulse' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {isNavigating ? (
            <Navigation className="w-5 h-5 rotate-45 text-parking-primary fill-parking-primary" />
          ) : (
            <Compass className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ParkingMap;
