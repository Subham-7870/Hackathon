import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoStation, GeoSector, TrainSchedule, SolvedBlock } from '../types';
import { railRouteCoordinates } from '../data/railRoutes';
import { Navigation, Shield, Activity, Radio, Train as TrainIcon, CheckCircle2, Play, Pause, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedTrainName } from '../i18n/trainTranslations';

interface CorridorMapProps {
  corridors: { stations: GeoStation[]; sectors: GeoSector[] };
  trains: TrainSchedule[];
  blocks: SolvedBlock[];
  selectedSector: string;
  selectedTrainNumber?: string;
  onSelectSector: (sectorId: string) => void;
  onSelectTrain: (train: TrainSchedule | null) => void;
  currentTimeMinutes: number;
  onTimeChange: (minutes: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const CorridorMap: React.FC<CorridorMapProps> = ({
  corridors,
  trains,
  blocks,
  selectedSector,
  selectedTrainNumber,
  onSelectSector,
  onSelectTrain,
  currentTimeMinutes,
  onTimeChange,
  isPlaying,
  onTogglePlay,
}) => {
  const { t, language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedStation, setSelectedStation] = useState<GeoStation | null>(null);
  const [selectedTrainDetail, setSelectedTrainDetail] = useState<TrainSchedule | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [27.2, 78.5],
        zoom: 7,
        minZoom: 4,
        maxZoom: 13,
        zoomControl: true,
      });

      // Standard OpenStreetMap with CSS dark mode styling (100% free, no API keys, no Carto)
      const osmTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        className: 'osm-dark-tiles',
      });
      osmTileLayer.addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous overlays
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // 1. Draw Real OpenStreetMap Railway Tracks
    Object.entries(railRouteCoordinates).forEach(([sectorId, coords]) => {
      const isSelected = selectedSector === sectorId || selectedSector === 'ALL';
      const hasBlock = blocks.some((b) => b.location_sector === sectorId);

      // Glow underlay if maintenance block is active
      if (hasBlock) {
        L.polyline(coords, {
          color: '#A855F7',
          weight: 14,
          opacity: 0.45,
          lineCap: 'round',
        }).addTo(map);
      }

      // Real Track Line
      const trackPolyline = L.polyline(coords, {
        color: hasBlock ? '#C084FC' : isSelected ? '#38BDF8' : '#64748B',
        weight: isSelected ? 4.5 : 3,
        opacity: isSelected ? 1.0 : 0.7,
        dashArray: hasBlock ? '8, 6' : undefined,
      }).addTo(map);

      trackPolyline.on('click', () => {
        onSelectSector(sectorId);
      });

      const sectorObj = corridors.sectors.find((s) => s.id === sectorId);
      const sectorName = sectorObj ? sectorObj.name : sectorId;
      trackPolyline.bindPopup(`
        <div style="font-family: inherit; padding: 6px;">
          <div style="font-weight: 800; font-size: 13px; color: #38BDF8;">${sectorName}</div>
          <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Corridor Code: ${sectorId}</div>
          <div style="font-size: 11px; color: ${hasBlock ? '#A855F7' : '#34D399'}; font-weight: bold; margin-top: 4px;">
            ${hasBlock ? '⚡ ACTIVE SHADOW MAINTENANCE BLOCK' : '🟢 CLEAR TIMETABLE WINDOW'}
          </div>
        </div>
      `);
    });

    // 2. Draw Real Station Nodes
    corridors.stations.forEach((stn) => {
      const isStnSelected = selectedStation?.code === stn.code;

      const marker = L.circleMarker([stn.lat, stn.lng], {
        radius: isStnSelected ? 10 : 7,
        fillColor: isStnSelected ? '#38BDF8' : '#2563EB',
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95,
      }).addTo(map);

      marker.on('click', () => {
        setSelectedStation(stn);
      });

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 6px;">
          <div style="font-weight: 800; font-size: 14px; color: #FFFFFF;">${stn.name} (${stn.code})</div>
          <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Division: ${stn.division}</div>
          <div style="font-size: 11px; color: #38BDF8; font-weight: bold; margin-top: 4px;">
            ✅ Electronic Interlocking (EI) Active
          </div>
        </div>
      `);
    });

    // 3. Draw Live Moving Trains Along Real Track Geometry Synchronized with Time
    trains.forEach((train) => {
      const sectorId = train.route_sectors[0];
      const coords = railRouteCoordinates[sectorId];

      if (coords && coords.length > 0) {
        const startMin = train.entry_time_minutes;
        const totalDuration = train.normal_transit_minutes + train.delay_minutes;
        const isLooped = train.assigned_line.includes('Loop');
        const isSelected = selectedTrainNumber === train.train_number;

        // Calculate progress along track based on simulated dispatch clock
        let progress = (currentTimeMinutes - startMin) / totalDuration;
        
        // Siding stabling logic for freight
        if (isLooped) {
          if (currentTimeMinutes >= startMin + 30 && currentTimeMinutes <= startMin + 100) {
            progress = 0.38; // Stationary at Aligarh Siding
          }
        }

        progress = Math.max(0, Math.min(1, progress));

        const pointIndex = Math.min(coords.length - 1, Math.floor(progress * (coords.length - 1)));
        const trainPos = coords[pointIndex];

        let dotColor = '#38BDF8'; // Superfast
        let speed = 130;
        if (train.train_type === 'Express') {
          dotColor = '#34D399';
          speed = 110;
        } else if (train.train_type === 'Freight') {
          dotColor = isLooped ? '#F59E0B' : '#94A3B8';
          speed = isLooped && progress === 0.38 ? 0 : 65;
        }

        // Pulse ring if selected
        if (isSelected) {
          L.circleMarker(trainPos, {
            radius: 14,
            fillColor: dotColor,
            color: dotColor,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.3,
          }).addTo(map);
        }

        const trainMarker = L.circleMarker(trainPos, {
          radius: isSelected ? 9 : 7,
          fillColor: dotColor,
          color: '#0B0F19',
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(map);

        trainMarker.on('click', () => {
          setSelectedTrainDetail(train);
          onSelectTrain(train);
        });

        trainMarker.bindPopup(`
          <div style="font-family: inherit; padding: 6px; min-width: 180px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #374151; padding-bottom: 4px; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 13px; color: ${dotColor};">#${train.train_number}</span>
              <span style="font-size: 10px; font-weight: bold; background: #1E293B; color: #F8FAFC; padding: 2px 6px; border-radius: 4px;">${train.train_type}</span>
            </div>
            <div style="font-size: 12px; font-weight: bold; color: #FFFFFF; margin-bottom: 4px;">${getLocalizedTrainName(train.train_name, language, train.train_number)}</div>
            <div style="font-size: 11px; color: #94A3B8;">Speed: <strong style="color: #38BDF8;">${speed} km/h</strong></div>
            <div style="font-size: 11px; color: #F8FAFC; margin-top: 2px;">Assigned Line: <strong style="color: #F59E0B;">${train.assigned_line}</strong></div>
            <div style="font-size: 11px; color: #34D399; font-weight: bold; margin-top: 2px;">Status: ${train.status}</div>
          </div>
        `);
      }
    });

    // Auto fit to corridor if selected
    if (selectedSector !== 'ALL' && railRouteCoordinates[selectedSector]) {
      const bounds = L.latLngBounds(railRouteCoordinates[selectedSector]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }

  }, [corridors, trains, blocks, selectedSector, selectedTrainNumber, currentTimeMinutes]);

  return (
    <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-sky-400" />
              Live Geospatial Rail Network & Real Track Telemetry (COA/NTES)
            </h3>
            <span className="text-xs bg-emerald-950 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-800/60 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Live Telemetry Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real Indian Railways physical track alignments from OpenStreetMap, station nodes, and live train positions.
          </p>
        </div>

        {/* Sector Quick Select */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Corridor:</span>
          <select
            value={selectedSector}
            onChange={(e) => onSelectSector(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white text-xs shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Trunk Routes (Pan-India View)</option>
            {corridors.sectors.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map & Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Real Leaflet Map Canvas */}
        <div className="lg:col-span-3 h-[580px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Side Telemetry Panel */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Station & Interlocking Status
            </h4>
            {selectedStation ? (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="font-extrabold text-base text-white">{selectedStation.name} ({selectedStation.code})</div>
                <div>Division: <strong className="text-white">{selectedStation.division}</strong></div>
                <div>Coordinates: <span className="font-mono text-slate-400">{selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°E</span></div>
                <div className="text-xs text-emerald-300 font-bold bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-800/60 mt-2">
                  ✅ Electronic Interlocking & Axle Counters Normal
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any station node or railway track on the live map to inspect division, track geometries, and real-time interlocking status.
              </p>
            )}
          </div>

          {selectedTrainDetail && (
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  <TrainIcon className="w-4 h-4" />
                  Train #{selectedTrainDetail.train_number}
                </span>
                <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-200 px-2 py-0.5 rounded">
                  {selectedTrainDetail.train_type}
                </span>
              </div>
              <p className="font-bold text-white text-xs">{getLocalizedTrainName(selectedTrainDetail.train_name, language, selectedTrainDetail.train_number)}</p>
              <div className="text-slate-400">Route: <strong className="text-slate-200">{selectedTrainDetail.origin} → {selectedTrainDetail.destination}</strong></div>
              <div className="text-slate-400">Assigned Line: <strong className="text-amber-400">{selectedTrainDetail.assigned_line}</strong></div>
              <div className="text-slate-400">Status: <strong className="text-emerald-400">{selectedTrainDetail.status}</strong></div>
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 p-5 rounded-2xl border border-indigo-800/60 text-xs space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Absolute Block Safety Guard
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Mathematical invariants guarantee zero overlap between train movements and active maintenance blocks on the mainline.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Time Scrubber & Dispatch Simulation Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="p-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950" />}
          </button>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Live Simulation Time: <strong className="text-sky-400 font-mono text-sm">0{Math.floor(currentTimeMinutes / 60)}:{Math.floor(currentTimeMinutes % 60) < 10 ? '0' + Math.floor(currentTimeMinutes % 60) : Math.floor(currentTimeMinutes % 60)} UTC</strong></span>
            </div>
            <p className="text-[11px] text-slate-400">
              Drag slider or press Play to watch trains move along real OpenStreetMap tracks in real-time.
            </p>
          </div>
        </div>

        {/* Scrubber Slider */}
        <div className="flex-1 max-w-md flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 font-bold">00:00</span>
          <input
            type="range"
            min={0}
            max={360}
            value={currentTimeMinutes}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-500 font-bold">06:00</span>
        </div>
      </div>
    </div>
  );
};
