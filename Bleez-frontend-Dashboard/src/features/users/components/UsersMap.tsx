import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography } from '@mui/material';

export interface MapUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  online: boolean;
  lat: number;
  lng: number;
  place: string;
}

interface Props {
  users: MapUser[];
  mode: 'light' | 'dark';
  focusId?: string | null;
  height?: number | string;
}

const CSS = `
.bz-pin{position:relative;width:22px;height:22px}
.bz-pin .core{position:absolute;inset:5px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.bz-pin.on .core{background:#10B981}
.bz-pin.on .ring{position:absolute;inset:0;border-radius:50%;background:rgba(16,185,129,.45);animation:bzPing 1.8s ease-out infinite}
.bz-pin.off .core{background:#94A3B8;inset:7px}
@keyframes bzPing{0%{transform:scale(.5);opacity:1}100%{transform:scale(2.2);opacity:0}}
.leaflet-container{font-family:inherit;border-radius:16px}
.bz-dark-tiles{filter:invert(1) hue-rotate(180deg) brightness(.9) contrast(.9)}
.leaflet-popup-content-wrapper{border-radius:14px}
`;

const icon = (online: boolean) =>
  L.divIcon({
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
    html: `<div class="bz-pin ${online ? 'on' : 'off'}">${online ? '<div class="ring"></div>' : ''}<div class="core"></div></div>`,
  });

const Controller: React.FC<{ users: MapUser[]; focusId?: string | null }> = ({ users, focusId }) => {
  const map = useMap();
  // Fit all points whenever the visible set changes.
  const key = users.map((u) => u.id).join(',');
  useEffect(() => {
    if (!users.length) return;
    if (users.length === 1) map.setView([users[0].lat, users[0].lng], 5, { animate: true });
    else map.flyToBounds(L.latLngBounds(users.map((u) => [u.lat, u.lng] as [number, number])), { padding: [50, 50], maxZoom: 6, duration: 0.9 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    const u = users.find((x) => x.id === focusId);
    if (u) map.flyTo([u.lat, u.lng], 8, { duration: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);
  return null;
};

export const UsersMap: React.FC<Props> = ({ users, mode, focusId, height = 440 }) => {
  return (
    <Box sx={{ height, borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      <style>{CSS}</style>
      <MapContainer center={[20, 10]} zoom={2} minZoom={2} worldCopyJump style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} className={mode === 'dark' ? 'bz-dark-tiles' : ''} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        <Controller users={users} focusId={focusId} />
        {users.map((u) => (
          <Marker key={u.id} position={[u.lat, u.lng]} icon={icon(u.online)} zIndexOffset={u.online ? 1000 : 0}>
            <Popup>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{u.name}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>{u.email}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#475569', mt: 0.5 }}>📍 {u.place}</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mt: 0.5, color: u.online ? '#059669' : '#64748B' }}>
                ● {u.online ? 'Active now' : 'Offline (last known location)'}
              </Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {users.length === 0 && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Typography sx={{ px: 2, py: 1, borderRadius: '12px', bgcolor: 'background.paper', fontWeight: 700, fontSize: '0.85rem', boxShadow: 3 }}>
            No users with a shared location match these filters
          </Typography>
        </Box>
      )}
    </Box>
  );
};
