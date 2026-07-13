import { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Circle, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { Compass, Navigation, Eye, MapPin, Car, ArrowUpDown, Search, ChevronDown } from 'lucide-react';
import LotMarker from './LotMarker.jsx';
import SlotMarker from './SlotMarker.jsx';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
  position: 'relative'
};

// Helper to calculate coordinate of each slot inside a parking row line
const getSlotCoordinates = (lot, index, totalSlots) => {
  // Custom angles and spacing to align perfectly with the map's satellite layout
  let latSpacing = 0.000006;
  let lngSpacing = 0.000018;

  if (lot.name && lot.name.includes("Los Caballeros")) {
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

const ParkingMap = ({ lots, slots = null, center = { lat: 15.9766, lng: 120.4869 }, zoom = 15, searchedPlace = null, hoveredLotId = null }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [is3D, setIs3D] = useState(false);
  
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

  const [startInput, setStartInput] = useState('Your location');
  const [startCoords, setStartCoords] = useState(null);
  
  const [destInput, setDestInput] = useState('');
  const [destCoords, setDestCoords] = useState(null);

  // Automatically update startCoords when userPos changes and startInput is 'Your location'
  useEffect(() => {
    if (userPos && startInput === 'Your location') {
      setStartCoords(userPos);
    }
  }, [userPos, startInput]);

  // Sync destination based on active lot selection
  const activeLot = lots.length === 1 ? lots[0] : lots.find(l => l._id === hoveredLotId);
  useEffect(() => {
    if (activeLot) {
      setDestInput(activeLot.name);
      setDestCoords({ lat: activeLot.lat, lng: activeLot.lng });
    } else if (lots.length > 0 && !destInput) {
      setDestInput(lots[0].name);
      setDestCoords({ lat: lots[0].lat, lng: lots[0].lng });
    }
  }, [activeLot, lots, destInput]);

  // Swap starting point and destination coordinates
  const handleSwap = () => {
    const tempInput = startInput;
    const tempCoords = startCoords;
    setStartInput(destInput);
    setStartCoords(destCoords);
    setDestInput(tempInput);
    setDestCoords(tempCoords);
  };

  // Helper to geocode address
  const geocodeAddress = (address, isStart = true) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address + ", Manaoag, Pangasinan, Philippines" }, (results, status) => {
      if (status === 'OK') {
        const loc = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        if (isStart) {
          setStartCoords(loc);
        } else {
          setDestCoords(loc);
        }
        if (map) {
          map.panTo(loc);
        }
      } else {
        console.warn('Geocoding error:', status);
      }
    });
  };

  const handleStartSearch = () => {
    if (startInput === 'Your location') {
      if (userPos) {
        setStartCoords(userPos);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserPos(pos);
            setStartCoords(pos);
          }
        );
      }
    } else {
      geocodeAddress(startInput, true);
    }
  };

  const handleDestSelect = (lotName) => {
    const lot = lots.find(l => l.name === lotName);
    if (lot) {
      setDestInput(lot.name);
      setDestCoords({ lat: lot.lat, lng: lot.lng });
    }
  };

  const origin = startCoords || userPos || (activeLot ? { lat: 15.9766, lng: 120.4869 } : null);
  const destination = destCoords || (activeLot ? { lat: activeLot.lat, lng: activeLot.lng } : null);

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
              url: 'https://maps.google.com/mapfiles/ms/icons/sportvenue.png', // Sport venue or user pin icon
              scaledSize: { width: 32, height: 32 }
            }}
          />
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#3b82f6', // Bright, beautiful blue route polyline
                strokeOpacity: 0.85,
                strokeWeight: 6,
              },
              suppressMarkers: true, // Keep our custom lot/slots markers
            }}
          />
        )}
      </GoogleMap>

      {/* Premium Directions Planner HUD Panel */}
      <div className="absolute top-4 left-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-teal-500/20 p-4 font-outfit space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Directions Planner</span>
          {directions && (
            <span className="text-[10px] bg-teal-500/10 text-teal-700 px-2 py-0.5 rounded-full font-bold">
              {directions.routes[0].legs[0].distance.text} ({directions.routes[0].legs[0].duration.text})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* vertical dots/icons side bar */}
          <div className="flex flex-col items-center gap-1 self-stretch py-2 shrink-0">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>
            <div className="w-0.5 flex-1 border-l-2 border-dotted border-gray-300" />
            <MapPin className="w-3.5 h-3.5 text-red-500" />
          </div>

          {/* inputs column */}
          <div className="flex-1 space-y-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartSearch()}
                onBlur={() => handleStartSearch()}
                placeholder="Choose starting point..."
                className="w-full text-xs font-semibold pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={destInput}
                onChange={(e) => handleDestSelect(e.target.value)}
                className="w-full text-xs font-semibold pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition appearance-none"
              >
                {lots.map(lot => (
                  <option key={lot._id} value={lot.name}>{lot.name}</option>
                ))}
                {lots.length === 0 && <option>No lots available</option>}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Swapping button */}
          <button
            onClick={handleSwap}
            title="Swap starting point and destination"
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition self-center shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setStartInput('Your location'); setStartCoords(userPos); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 transition"
          >
            <Navigation className="w-3 h-3 fill-current rotate-45" />
            Your Location
          </button>
          <button
            onClick={() => { setStartInput('Manaoag Church'); geocodeAddress('Manaoag Church', true); }}
            className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 transition"
          >
            Manaoag Church
          </button>
        </div>
      </div>

      {/* Premium Floating Navigation & Perspective HUD Panel */}
      <div className="absolute bottom-6 right-16 z-10 flex flex-col gap-3">
        {/* Toggle 2D / 3D Tilt button */}
        <button
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
        </button>

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
