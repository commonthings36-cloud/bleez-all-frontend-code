import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography } from '@mui/material';

export interface SosPoint {
  id: string;
  name: string;
  note: string;
  place: string;
  time: string;
  lat: number;
  lng: number;
  mapsUrl?: string | null;
  latest?: boolean;
  ts?: number;
}

const CSS = `
.sos-pin{position:relative;width:26px;height:26px}
.sos-pin .core{position:absolute;inset:6px;border-radius:50%;background:#EF4444;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45)}
.sos-pin .ring{position:absolute;inset:0;border-radius:50%;background:rgba(239,68,68,.5);animation:sosPing 1.6s ease-out infinite}
.sos-pin.old .ring{display:none}
.sos-pin.old .core{background:#F87171;inset:8px;opacity:.85}
@keyframes sosPing{0%{transform:scale(.5);opacity:1}100%{transform:scale(2.4);opacity:0}}
.leaflet-container{font-family:inherit;border-radius:16px}
.bz-dark-tiles{filter:invert(1) hue-rotate(180deg) brightness(.9) contrast(.9)}
.leaflet-popup-content-wrapper{border-radius:14px}
`;

const icon = (latest?: boolean) =>
  L.divIcon({
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -10],
    html: `<div class="sos-pin ${latest ? '' : 'old'}"><div class="ring"></div><div class="core"></div></div>`,
  });

const Controller: React.FC<{ points: SosPoint[]; focusId?: string | null }> = ({ points, focusId }) => {
  const map = useMap();
  const key = points.map((p) => p.id).join(',');
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 6);
    else map.flyToBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [50, 50], maxZoom: 7, duration: 0.9 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    const p = points.find((x) => x.id === focusId);
    if (p) map.flyTo([p.lat, p.lng], 12, { duration: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);
  return null;
};

export const SosMap: React.FC<{ points: SosPoint[]; mode: 'light' | 'dark'; focusId?: string | null; height?: number }> = ({ points, mode, focusId, height = 440 }) => {
  return (
    <Box sx={{ height, borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      <style>{CSS}</style>
      <MapContainer center={[20, 10]} zoom={2} minZoom={2} worldCopyJump style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} className={mode === 'dark' ? 'bz-dark-tiles' : ''} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        <Controller points={points} focusId={focusId} />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icon(p.latest)} zIndexOffset={p.latest ? 1000 : 0}>
            <Popup>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#B91C1C' }}>🚨 {p.name}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#334155', mt: 0.25 }}>{p.note}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#475569', mt: 0.5 }}>📍 {p.place}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>🕒 {p.time}</Typography>
              {p.mapsUrl && (
                <a href={p.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7C3AED' }}>
                  Open in Google Maps ↗
                </a>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {points.length === 0 && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Typography sx={{ px: 2, py: 1, borderRadius: '12px', bgcolor: 'background.paper', fontWeight: 700, fontSize: '0.85rem', boxShadow: 3 }}>
            No geotagged SOS incidents to show
          </Typography>
        </Box>
      )}
    </Box>
  );
};
