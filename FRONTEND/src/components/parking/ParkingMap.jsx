import { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Circle, useJsApiLoader, DirectionsRenderer, Polygon } from '@react-google-maps/api';
import { Compass, Navigation, Eye, MapPin, Car, Layers } from 'lucide-react';
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

// Helper to calculate coordinate of each slot inside a parking row line
const getSlotCoordinates = (lot, index, totalSlots) => {
  // Custom angles and spacing to align perfectly with the map's satellite layout
  let latSpacing = 0.000006;
  let lngSpacing = 0.000018;

  if (lot.name && (lot.name.includes("Los Caballeros") || lot.name.includes("LCC"))) {
    // Los Caballeros is a diagonal line along Milo St (North-West to South-East)
    latSpacing = -0.000007;
    lngSpacing = 0.000014;
  } else if (lot.name && lot.name.includes("Church")) {
    // Church is a line running North to South
    latSpacing = 0.000010;
    lngSpacing = 0.000004;
  } else if (lot.name && lot.name.includes("Market")) {
    // Market is running West to East
    latSpacing = 0.000002;
    lngSpacing = 0.000015;
  }

  const startLatOffset = -((totalSlots - 1) / 2) * latSpacing;
  const startLngOffset = -((totalSlots - 1) / 2) * lngSpacing;

  return {
    lat: lot.lat + startLatOffset + (index * latSpacing),
    lng: lot.lng + startLngOffset + (index * lngSpacing)
  };
};

const ParkingMap = ({ lots, slots = null, center = { lat: 16.0446, lng: 120.4912 }, zoom = 15, searchedPlace = null, hoveredLotId = null }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [directions, setDirections] = useState(null);
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

  // Get active lot for directions destination
  const activeLot = lots.length === 1 ? lots[0] : lots.find(l => l._id === hoveredLotId);
  const destination = activeLot ? { lat: activeLot.lat, lng: activeLot.lng } : null;
  const origin = userPos || (destination ? { lat: 16.0446, lng: 120.4912 } : null);

  useEffect(() => {
    if (!isLoaded || !origin || !destination) {
      setDirections(null);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.warn(`error fetching directions: ${status}`);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

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
        {lots.map((lot) => (
          <Circle
            key={`boundary-${lot._id}`}
            center={{ lat: lot.lat, lng: lot.lng }}
            radius={lots.length === 1 ? 22 : 35} // slightly larger radius on general search map for readability
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
        ))}

        {slots && slots.length > 0 ? (
          // Slot-level detail view: render individual slots as red/green circular markers in a line
          slots.map((slot, index) => {
            const pos = getSlotCoordinates(lots[0], index, slots.length);
            return (
              <SlotMarker
                key={slot._id}
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
          <Marker
            position={userPos}
            icon={{
              url: userBlueDotIcon,
              scaledSize: { width: 34, height: 34 },
              anchor: new window.google.maps.Point(17, 17)
            }}
          />
        )}

        {isNavigating && directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#1a73e8', // Bright, beautiful Google Maps blue route polyline
                strokeOpacity: 0.85,
                strokeWeight: 6,
              },
              suppressMarkers: true, // Keep our custom lot/slots markers
            }}
          />
        )}
      </GoogleMap>

      {isNavigating && directions && (
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-teal-500/20 flex flex-col gap-3 animate-fade-in font-outfit w-72">
          {/* Mins and Km header */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
            <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
              <Car className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#063b31] text-sm leading-tight">
                {directions.routes[0].legs[0].duration.text}
              </h4>
              <p className="text-xs text-gray-500 font-semibold">
                {directions.routes[0].legs[0].distance.text} • Driving Route
              </p>
            </div>
          </div>

          {/* Start and Destination list */}
          <div className="flex gap-2">
            <div className="flex flex-col items-center gap-1 py-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border border-blue-500 bg-blue-500" />
              <div className="w-0.5 flex-grow border-l border-dashed border-gray-300" />
              <MapPin className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="flex-1 text-[11px] font-semibold space-y-1 text-gray-600 overflow-hidden">
              <div className="truncate">
                <span className="text-[8px] text-gray-400 block font-bold uppercase tracking-wider">Start point</span>
                {userPos ? 'Your location' : 'Manaoag Center'}
              </div>
              <div className="truncate">
                <span className="text-[8px] text-gray-400 block font-bold uppercase tracking-wider">Destination</span>
                {activeLot?.name || 'Parking Lot'}
              </div>
            </div>
          </div>
        </div>
      )}

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
