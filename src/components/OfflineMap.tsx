import React, { useState } from 'react';
import { Station } from '../types';
import { MapPin, Info, Navigation, Globe, Search, ArrowRight } from 'lucide-react';

interface OfflineMapProps {
  stations: Station[];
  activeDetails: Station | null;
  setActiveDetails: (s: Station | null) => void;
  searchQuery: string;
  filterType: 'all' | 'rosatom' | 'tpu' | 'joint';
  theme: 'rosatom' | 'tpu';
}

export function OfflineMap({
  stations,
  activeDetails,
  setActiveDetails,
  searchQuery,
  filterType,
  theme
}: OfflineMapProps) {
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);

  // Projection boundaries matching the geographic spread of Russia + CIS
  const minLat = 41.0;
  const maxLat = 75.0;
  const minLon = 19.0;
  const maxLon = 145.0;

  // Convert geocoordinates to percentage positions on the custom SVG grid
  const getCoordinates = (lat: number, lon: number) => {
    // Linear (equirectangular) mapping
    let x = ((lon - minLon) / (maxLon - minLon)) * 100;
    let y = (1.0 - (lat - minLat) / (maxLat - minLat)) * 100;

    // Apply strict bounds padding to avoid overflow near the canvas border
    x = Math.max(5, Math.min(95, x));
    y = Math.max(7, Math.min(91, y));

    return { x, y };
  };

  // Safe checks for filtering
  const activeQuery = searchQuery.toLowerCase().trim();
  const filteredStations = stations.filter(s => {
    const matchQuery = !activeQuery || 
      s.name.toLowerCase().includes(activeQuery) || 
      (s.city && s.city.toLowerCase().includes(activeQuery)) || 
      s.shortInfo.toLowerCase().includes(activeQuery);

    const matchType = filterType === 'all' || s.type === filterType;
    return matchQuery && matchType;
  });

  // Color schemes based on the theme & affiliation
  const isRosatomTheme = theme === 'rosatom';
  const gridLineColor = isRosatomTheme ? 'stroke-slate-200/50' : 'stroke-slate-200/50';
  const gridLabelColor = 'text-slate-400 font-mono text-[9px]';
  const compassColor = isRosatomTheme ? 'text-[#00509A]' : 'text-[#007A33]';

  return (
    <div className="w-full h-full relative flex flex-col bg-slate-900 overflow-hidden select-none" id="offline-map-canvas">
      
      {/* 1. Offline Mode Indicator Status Bar */}
      <div className="absolute top-4 left-4 z-30 pointer-events-auto">
        <div className="bg-slate-950/90 border border-amber-500/30 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-amber-400 font-bold tracking-wider leading-none">АВТОНОМНЫЙ РЕЖИМ</span>
            <span className="text-[8px] text-slate-400 mt-0.5 leading-none">Карта загружена с флешки (без интернета)</span>
          </div>
        </div>
      </div>

      {/* Connection Indicator Overlay */}
      <div className="absolute top-4 right-4 z-30 pointer-events-none">
        <div className="bg-slate-950/90 border border-slate-700/50 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2.5 shadow-lg text-slate-300 font-mono text-[10px]">
          <span className="text-slate-500 uppercase tracking-wider font-bold">БАЗА ДАННЫХ:</span>
          <span className="text-emerald-400 font-bold tracking-wider">ЛОКАЛЬНЫЙ КЭШ</span>
        </div>
      </div>

      {/* 2. Interactive SVG Map Canvas */}
      <div className="flex-1 w-full h-full relative min-h-[350px]">
        
        {/* Core Schematic background SVG illustration */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid Pattern Background */}
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" className="stroke-slate-800/30" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Latitude Lines (Horizontal coordinates) */}
          <line x1="5%" y1="15%" x2="95%" y2="15%" className={gridLineColor} strokeDasharray="3 3" />
          <line x1="5%" y1="35%" x2="95%" y2="35%" className={gridLineColor} strokeDasharray="3 3" />
          <line x1="5%" y1="55%" x2="95%" y2="55%" className={gridLineColor} strokeDasharray="3 3" />
          <line x1="5%" y1="75%" x2="95%" y2="75%" className={gridLineColor} strokeDasharray="3 3" />

          {/* Longitude Lines (Vertical coordinates) */}
          <line x1="15%" y1="7%" x2="15%" y2="93%" className={gridLineColor} strokeDasharray="3 3" />
          <line x1="35%" y1="7%" x2="35%" y2="93%" className={gridLineColor} strokeDasharray="3 3" />
          <line x1="55%" y1="7%" x2="55%" y2="93%" className={gridLineColor} strokeDasharray="3 3" />
          <line x1="75%" y1="7%" x2="75%" y2="93%" className={gridLineColor} strokeDasharray="3 3" />
          <line x1="90%" y1="7%" x2="90%" y2="93%" className={gridLineColor} strokeDasharray="3 3" />

          {/* Grid Degree Annotations */}
          <text x="6%" y="14%" className={gridLabelColor}>70°N</text>
          <text x="6%" y="34%" className={gridLabelColor}>60°N</text>
          <text x="6%" y="54%" className={gridLabelColor}>50°N</text>
          <text x="6%" y="74%" className={gridLabelColor}>40°N</text>

          <text x="16%" y="92%" className={gridLabelColor}>30°E</text>
          <text x="36%" y="92%" className={gridLabelColor}>60°E</text>
          <text x="56%" y="92%" className={gridLabelColor}>90°E</text>
          <text x="76%" y="92%" className={gridLabelColor}>120°E</text>
          <text x="91%" y="92%" className={gridLabelColor}>140°E</text>

          {/* Stylized borders contour profile of Russia (Cyan-Blue cyber borders silhouette) */}
          <path 
            d="M 50,140 Q 60,110 80,105 T 120,80 T 170,120 T 230,90 T 290,95 T 350,90 T 420,85 T 510,80 T 600,105 T 690,100 T 780,110 T 870,120 Q 940,90 950,150 L 920,180 L 930,240 L 890,265 L 855,270 L 790,240 L 720,230 L 640,260 L 530,240 L 410,265 L 320,250 L 260,285 L 180,240 L 100,245 L 80,195 Q 60,165 50,140 Z" 
            fill="none" 
            className="stroke-slate-700/35"
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 50,140 Q 60,110 80,105 T 120,80 T 170,120 T 230,90 T 290,95 T 350,90 T 420,85 T 510,80 T 600,105 T 690,100 T 780,110 T 870,120 Q 940,90 950,150 L 920,180 L 930,240 L 890,265 L 855,270 L 790,240 L 720,230 L 640,260 L 530,240 L 410,265 L 320,250 L 260,285 L 180,240 L 100,245 L 80,195 Q 60,165 50,140 Z" 
            fill="none" 
            className={isRosatomTheme ? 'stroke-[#00509A]/15' : 'stroke-[#007A33]/15'}
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Reference cities on the offline projection schematic */}
          <g opacity="0.35">
            {/* Moscow */}
            <circle cx="20%" cy="51%" r="3" fill="#ffffff" />
            <text x="21%" y="51%" fill="#94a3b8" className="font-sans text-[9px] font-semibold" dy="2">Москва</text>

            {/* Novosibirsk */}
            <circle cx="51%" cy="55%" r="3" fill="#ffffff" />
            <text x="52%" y="55%" fill="#94a3b8" className="font-sans text-[9px] font-semibold" dy="2">Новосибирск</text>

            {/* Vladivostok */}
            <circle cx="84%" cy="76%" r="3" fill="#ffffff" />
            <text x="81%" y="82%" fill="#94a3b8" className="font-sans text-[9px] font-semibold" dy="2">Владивосток</text>
          </g>
        </svg>

        {/* 3. Render Stations Dynamic Interactive Nodes */}
        {filteredStations.map((s) => {
          const { x, y } = getCoordinates(s.lat, s.lon);

          // Affiliation Specific Classes
          let nodeBg = 'bg-[#00509A] hover:bg-blue-500';
          let borderGlowColor = 'rgba(0, 80, 154, 0.4)';
          let pingColor = 'bg-blue-400';
          let textColor = 'text-blue-400';

          if (s.type === 'tpu') {
            nodeBg = 'bg-[#007A33] hover:bg-green-500';
            borderGlowColor = 'rgba(0, 122, 51, 0.4)';
            pingColor = 'bg-green-400';
            textColor = 'text-green-400';
          } else if (s.type === 'joint') {
            nodeBg = 'bg-purple-600 hover:bg-purple-500';
            borderGlowColor = 'rgba(126, 34, 206, 0.4)';
            pingColor = 'bg-purple-400';
            textColor = 'text-purple-400';
          }

          const isSelected = activeDetails?.id === s.id;

          return (
            <div 
              key={s.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-300"
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setHoveredStation(s)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              {/* Pulsing indicator aura */}
              <div className="relative flex items-center justify-center">
                <span className={`absolute inline-flex h-7 w-7 rounded-full opacity-60 animate-ping ${pingColor}`}></span>
                
                <button
                  onClick={() => setActiveDetails(s)}
                  className={`relative flex items-center justify-center w-5 h-5 rounded-full border border-white text-white font-bold transition-all hover:scale-135 focus:outline-none cursor-pointer ${nodeBg} ${
                    isSelected ? 'ring-4 ring-offset-2 ring-offset-slate-900 ring-white scale-125' : ''
                  }`}
                  style={{ boxShadow: `0 0 10px ${borderGlowColor}` }}
                >
                  <MapPin className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Instant Map Pin Name Tag Banner (Visible always) */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/85 px-1.5 py-0.5 rounded border border-slate-700/50 text-[8px] font-sans font-medium text-slate-300 tracking-wide pointer-events-none shadow-md">
                {s.city || 'Узел'}
              </div>
            </div>
          );
        })}

        {/* 4. Hover Balloon popup (Mimics Yandex balloon in offline mode) */}
        {hoveredStation && (
          <div 
            className="absolute z-40 bg-slate-950/95 border border-slate-700/80 backdrop-blur rounded p-3 shadow-2xl text-slate-200 pointer-events-none transition-all w-60"
            style={{ 
              left: `${getCoordinates(hoveredStation.lat, hoveredStation.lon).x}%`, 
              top: `${getCoordinates(hoveredStation.lat, hoveredStation.lon).y - 28}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-950"></div>
            <h5 className="font-sans text-xs font-bold leading-tight mb-1">{hoveredStation.name}</h5>
            <div className="flex gap-2 items-center mb-2">
              <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                hoveredStation.type === 'rosatom' ? 'bg-[#00509A]/20 border-blue-500/30 text-blue-400' :
                hoveredStation.type === 'tpu' ? 'bg-[#007A33]/20 border-green-500/30 text-green-400' :
                'bg-purple-600/20 border-purple-500/30 text-purple-400'
              }`}>
                {hoveredStation.type === 'rosatom' ? 'ГК РОСАТОМ' : hoveredStation.type === 'tpu' ? 'ТПУ' : 'СОВМЕСТНО'}
              </span>
              {hoveredStation.city && (
                <span className="text-[9px] text-slate-400">📍 {hoveredStation.city}</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
              {hoveredStation.shortInfo}
            </p>
            <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-500 bg-slate-900/60 p-1 border border-slate-800/80 rounded">
              <span>Ш: {hoveredStation.lat.toFixed(4)}</span>
              <span>Д: {hoveredStation.lon.toFixed(4)}</span>
            </div>
          </div>
        )}

      </div>

      {/* Compass / Map Grid Legend Widget */}
      <div className="absolute bottom-4 left-4 w-52 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg shadow-2xl p-3 z-30 pointer-events-auto">
        <h4 className="text-[10px] font-mono font-bold text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
          <Globe className={`w-3.5 h-3.5 ${compassColor}`} />
          <span>СЕТКА КООРДИНАТ</span>
        </h4>
        <p className="text-[9.5px] text-slate-400 leading-relaxed">
          Карта адаптирована для работы оффлайн. Кликните по маркеру для открытия подробной карточки.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 text-[9px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00509A] rounded-full shadow-[0_0_6px_rgba(0,80,154,0.6)]"></div>
            <span>ГК РОСАТОМ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#007A33] rounded-full shadow-[0_0_6px_rgba(0,122,51,0.6)]"></div>
            <span>ТПУ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full shadow-[0_0_6px_rgba(147,51,234,0.6)]"></div>
            <span>СОВМЕСТНЫЕ ПРОЕКТЫ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
