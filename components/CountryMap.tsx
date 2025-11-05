'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CountryMapProps {
  countryName: string;
  capitalCity: string;
  latitude: number;
  longitude: number;
  population: string;
  gdpPerCapita?: string;
  povertyRate?: string;
  gni?: string; // Gross National Income
}

export function CountryMap({
  countryName,
  capitalCity,
  latitude,
  longitude,
  population,
  gdpPerCapita,
  povertyRate,
  gni
}: CountryMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
      dragging: true,
      doubleClickZoom: true
    });

    // Add black & white minimalistic tile layer
    // Using Stadia Maps Alidade Smooth (grayscale) or CartoDB Positron (light grayscale)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CartoDB',
      maxZoom: 19,
      className: 'grayscale'
    }).addTo(map);

    // Custom marker icon (minimalistic black dot)
    const customIcon = L.divIcon({
      html: `
        <div style="
          width: 12px;
          height: 12px;
          background: #1c1917;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    // Add marker for capital
    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

    // Create info popup with minimalistic design
    const popupContent = `
      <div style="
        font-family: system-ui, -apple-system, sans-serif;
        color: #1c1917;
        padding: 8px 4px;
        min-width: 200px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1c1917;
          border-bottom: 2px solid #e7e5e4;
          padding-bottom: 6px;
        ">
          ${countryName}
        </div>
        <div style="font-size: 13px; color: #57534e; margin-bottom: 12px;">
          <div style="margin-bottom: 4px;">
            <span style="font-weight: 600;">Capital:</span> ${capitalCity}
          </div>
        </div>
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 12px;
          background: #fafaf9;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #e7e5e4;
        ">
          <div>
            <div style="color: #78716c; font-size: 10px; margin-bottom: 2px;">POPULATION</div>
            <div style="font-weight: 700; color: #1c1917;">${population}</div>
          </div>
          ${gdpPerCapita ? `
          <div>
            <div style="color: #78716c; font-size: 10px; margin-bottom: 2px;">GDP/CAPITA</div>
            <div style="font-weight: 700; color: #1c1917;">${gdpPerCapita}</div>
          </div>
          ` : ''}
          ${gni ? `
          <div>
            <div style="color: #78716c; font-size: 10px; margin-bottom: 2px;">GNI</div>
            <div style="font-weight: 700; color: #1c1917;">${gni}</div>
          </div>
          ` : ''}
          ${povertyRate ? `
          <div>
            <div style="color: #78716c; font-size: 10px; margin-bottom: 2px;">POVERTY RATE</div>
            <div style="font-weight: 700; color: #1c1917;">${povertyRate}</div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    }).openPopup();

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [countryName, capitalCity, latitude, longitude, population, gdpPerCapita, povertyRate, gni]);

  return (
    <>
      <div 
        ref={containerRef} 
        className="w-full h-96 rounded-lg overflow-hidden border border-stone-200"
        style={{ filter: 'grayscale(100%) contrast(1.1)' }}
      />
      
      {/* Add custom CSS for map styling */}
      <style jsx global>{`
        .leaflet-container {
          background: #fafaf9;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .leaflet-popup-content-wrapper {
          background: white;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-popup-tip {
          background: white;
          border: 1px solid #e7e5e4;
        }
        
        .leaflet-control-zoom {
          border: 1px solid #e7e5e4 !important;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .leaflet-control-zoom a {
          background: white !important;
          color: #1c1917 !important;
          border: none !important;
          border-bottom: 1px solid #e7e5e4 !important;
        }
        
        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: #f5f5f4 !important;
        }
        
        .leaflet-popup-close-button {
          color: #57534e !important;
        }
        
        .leaflet-popup-close-button:hover {
          color: #1c1917 !important;
        }
      `}</style>
    </>
  );
}

