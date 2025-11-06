'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InteractiveWorldMapProps {
  countries: Array<{
    name: string;
    iso2_code: string;
    iso3_code?: string;
    region: string;
    latitude?: string;
    longitude?: string;
    capital_city?: string;
    active_projects?: number;
    population?: string;
  }>;
  onCountryHover?: (countryName: string | null) => void;
}

export function InteractiveWorldMap({ countries, onCountryHover }: InteractiveWorldMapProps) {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  // Single color for all countries
  const markerColor = '#0071bc';

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Detect if mobile
    const isMobile = window.innerWidth < 1024;
    
    // Initialize map with world view
    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: isMobile ? 1.5 : 2,
      minZoom: isMobile ? 1 : 2,
      maxZoom: 6,
      zoomControl: true,
      scrollWheelZoom: false, // Disable scroll zoom to prevent page scroll conflicts
      dragging: true,
      doubleClickZoom: true,
      touchZoom: true, // Enable pinch zoom on mobile
      tap: true, // Enable tap events on mobile
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 0.5
    });

    // Add tile layer with clean style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CartoDB',
      maxZoom: 19,
      className: 'world-map-tiles'
    }).addTo(map);

    mapRef.current = map;

    // Add markers for each country with coordinates
    const markers: L.Marker[] = [];
    
    countries.forEach(country => {
      if (country.latitude && country.longitude) {
        const lat = parseFloat(country.latitude);
        const lng = parseFloat(country.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Create custom icon with single color
          const markerIcon = L.divIcon({
            html: `
              <div class="country-marker-wrapper">
                <div class="country-marker" style="background: ${markerColor}; border-color: ${markerColor};"></div>
                <div class="country-marker-pulse" style="background: ${markerColor};"></div>
              </div>
            `,
            className: 'custom-country-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const marker = L.marker([lat, lng], { 
            icon: markerIcon,
            title: country.name
          }).addTo(map);

          // Create popup content
          const popupContent = `
            <div class="country-popup">
              <div class="country-popup-header">
                <div class="country-popup-dot" style="background: ${markerColor};"></div>
                <h3>${country.name}</h3>
              </div>
              <div class="country-popup-content">
                ${country.capital_city ? `<div class="popup-row"><span class="popup-label">Capital:</span> ${country.capital_city}</div>` : ''}
                ${country.region ? `<div class="popup-row"><span class="popup-label">Region:</span> ${country.region}</div>` : ''}
                ${country.population ? `<div class="popup-row"><span class="popup-label">Population:</span> ${country.population}</div>` : ''}
                ${country.active_projects ? `<div class="popup-row"><span class="popup-label">Projects:</span> <strong>${country.active_projects} active</strong></div>` : ''}
              </div>
              <div class="country-popup-footer">
                <span class="popup-hint">Click marker to view details →</span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 280,
            className: 'custom-country-popup',
            closeButton: true,
            autoPan: false, // Prevent map from panning when popup opens
            keepInView: true
          });

          // Click event to navigate
          marker.on('click', () => {
            router.push(`/country/${encodeURIComponent(country.name)}`);
          });

          // Hover events - optimized to prevent flickering
          let hoverTimeout: NodeJS.Timeout;
          
          marker.on('mouseover', () => {
            clearTimeout(hoverTimeout);
            onCountryHover?.(country.name);
            // Open popup immediately
            marker.openPopup();
          });

          marker.on('mouseout', () => {
            // Delay clearing hover state to prevent flicker
            hoverTimeout = setTimeout(() => {
              onCountryHover?.(null);
            }, 100);
          });

          markers.push(marker);
        }
      }
    });

    markersRef.current = markers;

    // Cleanup
    return () => {
      markers.forEach(marker => marker.remove());
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [countries, router, onCountryHover, markerColor]);

  return (
    <>
      <div 
        ref={containerRef} 
        className="w-full h-[450px] sm:h-[500px] lg:h-[600px] rounded-lg overflow-hidden touch-pan-y"
        style={{ touchAction: 'pan-y pinch-zoom' }}
      />
      
      {/* Custom Styling */}
      <style jsx global>{`
        .world-map-tiles {
          filter: brightness(1.02) contrast(1.05);
        }

        .custom-country-marker {
          background: transparent !important;
          border: none !important;
        }

        .country-marker-wrapper {
          position: relative;
          width: 20px;
          height: 20px;
        }

        .country-marker {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          z-index: 2;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          will-change: transform;
        }

        .country-marker:hover {
          transform: translate(-50%, -50%) scale(1.4);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10;
        }
        
        /* Prevent marker from flickering during hover transitions */
        .custom-country-marker {
          pointer-events: auto;
        }
        
        .country-marker-wrapper {
          pointer-events: none;
        }
        
        .country-marker {
          pointer-events: auto;
        }

        .country-marker-pulse {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          opacity: 0.4;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
        }

        .custom-country-popup .leaflet-popup-content-wrapper {
          background: white;
          border: 2px solid #e7e5e4;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          padding: 0;
          overflow: hidden;
        }

        .custom-country-popup .leaflet-popup-content {
          margin: 0;
          min-width: 250px;
        }

        .custom-country-popup .leaflet-popup-tip {
          background: white;
          border: 2px solid #e7e5e4;
        }

        .country-popup {
          font-family: system-ui, -apple-system, sans-serif;
        }

        .country-popup-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 2px solid #e7e5e4;
        }

        .country-popup-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink-0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .country-popup-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1c1917;
        }

        .country-popup-content {
          padding: 12px 16px;
        }

        .popup-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
          color: #44403c;
          border-bottom: 1px solid #f5f5f4;
        }

        .popup-row:last-child {
          border-bottom: none;
        }

        .popup-label {
          font-weight: 600;
          color: #78716c;
        }

        .country-popup-footer {
          padding: 10px 16px;
          background: #fafaf9;
          border-top: 1px solid #e7e5e4;
          text-align: center;
        }

        .popup-hint {
          font-size: 11px;
          color: #0071bc;
          font-weight: 600;
        }

        .leaflet-control-zoom {
          border: 2px solid #e7e5e4 !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .leaflet-control-zoom a {
          background: white !important;
          color: #1c1917 !important;
          border: none !important;
          border-bottom: 1px solid #e7e5e4 !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 20px !important;
          font-weight: 600 !important;
        }

        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }

        .leaflet-control-zoom a:hover {
          background: #f5f5f4 !important;
          color: #0071bc !important;
        }

        .leaflet-popup-close-button {
          color: #78716c !important;
          font-size: 24px !important;
          padding: 8px 12px !important;
        }

        .leaflet-popup-close-button:hover {
          color: #1c1917 !important;
          background: #f5f5f4 !important;
        }

        .leaflet-container {
          background: #e0f2fe;
          font-family: system-ui, -apple-system, sans-serif;
          touch-action: pan-y pinch-zoom;
        }
        
        /* Remove blue overlay on hover */
        .leaflet-interactive {
          outline: none !important;
        }
        
        .leaflet-interactive:hover {
          outline: none !important;
          stroke: none !important;
          fill-opacity: 1 !important;
        }
        
        .leaflet-container a {
          color: inherit !important;
        }
        
        .leaflet-container a:hover {
          background: none !important;
        }
        
        /* Disable default Leaflet hover effects */
        .leaflet-tile {
          border: none !important;
        }
        
        .leaflet-tile-container {
          pointer-events: none;
        }
        
        /* Optimize rendering performance */
        .leaflet-marker-pane {
          will-change: transform;
        }
        
        .leaflet-popup-pane {
          will-change: transform;
        }
        
        /* Larger tap targets on mobile */
        @media (max-width: 1023px) {
          .country-marker {
            width: 18px !important;
            height: 18px !important;
            border-width: 4px !important;
          }
          
          .country-marker-pulse {
            width: 26px !important;
            height: 26px !important;
          }
          
          .leaflet-control-zoom a {
            width: 44px !important;
            height: 44px !important;
            line-height: 44px !important;
            font-size: 22px !important;
          }
          
          .custom-country-popup .leaflet-popup-content-wrapper {
            max-width: 90vw !important;
          }
        }
        
        /* Improve touch feedback */
        .country-marker:active {
          transform: translate(-50%, -50%) scale(1.2);
        }
        
        /* Prevent iOS Safari bounce scroll */
        .leaflet-container {
          overscroll-behavior: contain;
        }
      `}</style>
    </>
  );
}
