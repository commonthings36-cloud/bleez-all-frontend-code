import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, InputAdornment, Stack, TextField, Typography, keyframes } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import FamilyRestroomOutlinedIcon from '@mui/icons-material/FamilyRestroomOutlined';
import LinkIcon from '@mui/icons-material/Link';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { useSnackbar } from 'notistack';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { TravelHeroArt } from '@/components/Illustrations';
import { B2bOrganization } from '../types/b2b.types';
import { b2bService } from '../services/b2b.service';

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;

// Starter values shown only until the organization has been saved.
const STARTER: B2bOrganization = {
  name: 'ABC Global Travel Specialists',
  branding: {
    companyName: 'ABC Global Travel',
    logoUrl: '',
    primaryColorHex: '#1E3A8A',
    secondaryColorHex: '#F59E0B',
    headerText: 'Exclusive Itinerary Prepared for Your Journey',
    footerText: 'ABC Global Travel • 24/7 Concierge: +1-800-555-0199',
    websiteUrl: 'https://abctravel.com',
    contactPhone: '+1-800-555-0199',
    contactEmail: 'concierge@abctravel.com',
  },
  aiConfig: {
    customInstructions: 'Always recommend boutique 5-star luxury hotels, private VIP airport transfers, and Michelin-starred dining options. Tone should be executive and elegant.',
    itineraryStyle: 'LUXURY_EXECUTIVE',
    tone: 'ELEGANT',
  },
};

const STYLES = [
  { v: 'LUXURY_EXECUTIVE', t: 'Luxury Executive', d: '5-star stays, VIP transfers', icon: <DiamondOutlinedIcon />, c: '#7C3AED' },
  { v: 'FAST_BUSINESS', t: 'Fast-Paced Business', d: 'Tight schedules, efficient routes', icon: <BoltOutlinedIcon />, c: '#F59E0B' },
  { v: 'BOUTIQUE_LEISURE', t: 'Boutique & Leisure', d: 'Relaxed, charming, local', icon: <SpaOutlinedIcon />, c: '#EC4899' },
  { v: 'FAMILY_ADVENTURE', t: 'Family Adventure', d: 'Activities for all ages', icon: <FamilyRestroomOutlinedIcon />, c: '#10B981' },
];
const TONES = [
  { v: 'ELEGANT', t: 'Elegant & Executive' },
  { v: 'CONCISE', t: 'Concise & Action-Oriented' },
  { v: 'FRIENDLY', t: 'Warm & Friendly' },
];

const isHex = (v?: string) => !!v && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
const safeHex = (v: string | undefined, fallback: string) => (isHex(v) ? v!.trim() : fallback);
/** Mix a hex colour toward white (amount > 0) or black (amount < 0). */
const shade = (hex: string, amount: number) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount)));
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};
const initials = (name?: string) => (name || 'B2B').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const roleColor: Record<string, string> = { OWNER: '#F59E0B', ADMIN: '#7C3AED', MEMBER: '#3B82F6', VIEWER: '#94A3B8' };

const SectionHead: React.FC<{ n?: number; icon: React.ReactNode; color: string; title: string; subtitle: string; right?: React.ReactNode }> = ({ icon, color, title, subtitle, right }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
    <Box sx={{ width: 40, height: 40, borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 8px 18px -8px ${color}` }}>{icon}</Box>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.78rem', lineHeight: 1.3, color: 'text.secondary' }}>{subtitle}</Typography>
    </Box>
    {right}
  </Stack>
);

const LogoBox: React.FC<{ url?: string; name?: string; size?: number; radius?: string }> = ({ url, name, size = 56, radius = '16px' }) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);
  return (
    <Box sx={{ width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: 'hidden', bgcolor: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -8px rgba(0,0,0,.35)' }}>
      {url && !broken ? (
        <Box component="img" src={url} alt="" onError={() => setBroken(true)} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.75 }} />
      ) : (
        <Typography sx={{ fontWeight: 800, color: '#4C1D95', fontSize: size * 0.34 }}>{initials(name)}</Typography>
      )}
    </Box>
  );
};

export const B2bPortalPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [org, setOrg] = useState<B2bOrganization>(STARTER);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(JSON.stringify(STARTER));
  const [isStarter, setIsStarter] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await b2bService.getMyOrganization();
      if (data && data.name) {
        setOrg(data);
        setSavedSnapshot(JSON.stringify(data));
        setIsStarter(false);
      }
    } catch {
      /* no saved organization yet — keep the starter template */
    }
  };
  useEffect(() => { load(); }, []);

  const dirty = JSON.stringify(org) !== savedSnapshot;
  const b = org.branding || {};
  const ai = org.aiConfig || {};
  const primary = safeHex(b.primaryColorHex, '#1E3A8A');
  const secondary = safeHex(b.secondaryColorHex, '#F59E0B');
  const members = org.members || [];

  const setBrand = (patch: Partial<NonNullable<B2bOrganization['branding']>>) => setOrg((o) => ({ ...o, branding: { ...o.branding, ...patch } }));
  const setAi = (patch: Partial<NonNullable<B2bOrganization['aiConfig']>>) => setOrg((o) => ({ ...o, aiConfig: { ...o.aiConfig, ...patch } }));

  const colorsValid = (!b.primaryColorHex || isHex(b.primaryColorHex)) && (!b.secondaryColorHex || isHex(b.secondaryColorHex));
  const canSave = dirty && !!org.name?.trim() && colorsValid && !saving;

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await b2bService.saveOrganization(org);
      const next = saved && saved.name ? saved : org;
      setOrg(next);
      setSavedSnapshot(JSON.stringify(next));
      setIsStarter(false);
      enqueueSnackbar('Organization branding & AI settings saved', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to save organization settings', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const colorField = (label: string, value: string | undefined, fallback: string, onChange: (v: string) => void) => (
    <TextField
      fullWidth label={label} value={value ?? fallback}
      onChange={(e) => onChange(e.target.value)}
      error={!!value && !isHex(value)} helperText={!!value && !isHex(value) ? 'Use a hex colour like #1E3A8A' : ' '}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Box component="label" sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: safeHex(value, fallback), border: '2px solid', borderColor: 'divider', cursor: 'pointer', overflow: 'hidden', position: 'relative', boxShadow: `0 4px 12px -4px ${safeHex(value, fallback)}` }}>
              <input type="color" value={safeHex(value, fallback).length === 7 ? safeHex(value, fallback) : fallback} onChange={(e) => onChange(e.target.value.toUpperCase())} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} aria-label={`${label} picker`} />
            </Box>
          </InputAdornment>
        ),
      }}
    />
  );

  const dateLabel = useMemo(() => (org.createdAt ? new Date(org.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : null), [org.createdAt]);

  return (
    <Box sx={{ pb: dirty ? 10 : 0 }}>
      <PageHeader
        title="B2B Organization"
        subtitle="White-label your PDF itineraries and tune the AI to your agency's voice."
        breadcrumbs={[{ label: 'B2B Organization' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={() => setOrg(JSON.parse(savedSnapshot))} disabled={!dirty}>Discard</Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={!canSave} sx={{ fontWeight: 800 }}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </Stack>
        }
      />

      {isStarter && (
        <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: '14px', alignItems: 'center' }}>
          <b>Starter template.</b> No organization has been saved yet, so sample values are shown. Edit them and press <b>Save changes</b> to create your organization.
        </Alert>
      )}

      {/* Organization hero */}
      <Box
        sx={{
          position: 'relative', overflow: 'hidden', borderRadius: '24px', px: { xs: 3, md: 4 }, py: { xs: 3, md: 3.5 }, mb: 3.5, color: '#fff',
          background: `linear-gradient(120deg, ${shade(primary, -0.25)} 0%, ${primary} 55%, ${shade(primary, 0.28)} 100%)`,
          boxShadow: `0 24px 48px -26px ${primary}`, animation: `${fadeUp} .6s ease-out both`, transition: 'background .4s',
        }}
      >
        {/* soft white shapes only — keeps the colour clean */}
        <Box sx={{ position: 'absolute', top: -90, right: -40, width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.08)' }} />
        <Box sx={{ position: 'absolute', bottom: -120, right: 140, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.06)' }} />
        <TravelHeroArt sx={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', width: 260, height: 160, opacity: 0.55, display: { xs: 'none', lg: 'block' } }} />
        {/* secondary colour as a crisp accent line */}
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, bgcolor: secondary, transition: 'background-color .3s' }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ position: 'relative' }}>
          <LogoBox url={b.logoUrl} name={b.companyName || org.name} size={76} radius="22px" />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.85rem' }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, color: '#fff' }}>{org.name || 'Unnamed organization'}</Typography>
            <Typography sx={{ opacity: 0.88, fontSize: '0.92rem', mt: 0.5, lineHeight: 1.4, color: '#fff' }}>{b.headerText || 'Add a header text for your PDF itineraries'}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.75 }}>
              {[
                { l: isStarter ? 'Not saved yet' : 'Active', dot: isStarter ? '#FBBF24' : '#34D399' },
                { l: `${members.length} member${members.length === 1 ? '' : 's'}`, icon: <GroupsOutlinedIcon sx={{ fontSize: 15 }} /> },
                ...(dateLabel ? [{ l: `Since ${dateLabel}` }] : []),
              ].map((c: any) => (
                <Box key={c.l} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, height: 28, px: 1.5, borderRadius: '8px', bgcolor: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.25)', fontWeight: 700, fontSize: '0.78rem', lineHeight: 1 }}>
                  {c.dot && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.dot }} />}
                  {c.icon}{c.l}
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, gap: 3, alignItems: 'start' }}>
        {/* ───── Left: settings ───── */}
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <GlassCard sx={{ p: 3, animation: `${fadeUp} .6s .1s ease-out both` }}>
            <SectionHead icon={<BadgeOutlinedIcon />} color="#6366F1" title="Identity" subtitle="Who the itineraries are prepared by" />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField fullWidth required label="Organization name" value={org.name || ''} onChange={(e) => setOrg({ ...org, name: e.target.value })} error={!org.name?.trim()} helperText={!org.name?.trim() ? 'Required' : ' '} />
              <TextField fullWidth label="Display name on PDFs" value={b.companyName || ''} onChange={(e) => setBrand({ companyName: e.target.value })} helperText=" " />
              <TextField fullWidth label="Logo URL (PNG / SVG)" value={b.logoUrl || ''} onChange={(e) => setBrand({ logoUrl: e.target.value })} sx={{ gridColumn: { sm: 'span 2' } }} helperText="A square logo on a transparent background works best" />
            </Box>
          </GlassCard>

          <GlassCard sx={{ p: 3, animation: `${fadeUp} .6s .18s ease-out both` }}>
            <SectionHead icon={<PaletteIcon />} color="#EC4899" title="Brand kit" subtitle="Colours and text printed on every PDF" />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {colorField('Primary colour', b.primaryColorHex, '#1E3A8A', (v) => setBrand({ primaryColorHex: v }))}
              {colorField('Secondary colour', b.secondaryColorHex, '#F59E0B', (v) => setBrand({ secondaryColorHex: v }))}
              <TextField fullWidth label="PDF header text" value={b.headerText || ''} onChange={(e) => setBrand({ headerText: e.target.value })} sx={{ gridColumn: { sm: 'span 2' } }} />
              <TextField fullWidth multiline rows={2} label="PDF footer & contact details" value={b.footerText || ''} onChange={(e) => setBrand({ footerText: e.target.value })} sx={{ gridColumn: { sm: 'span 2' } }} />
            </Box>
          </GlassCard>

          <GlassCard sx={{ p: 3, animation: `${fadeUp} .6s .26s ease-out both` }}>
            <SectionHead icon={<ContactMailOutlinedIcon />} color="#06B6D4" title="Contact details" subtitle="How travelers can reach your agency" />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField fullWidth label="Website" value={b.websiteUrl || ''} onChange={(e) => setBrand({ websiteUrl: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment> }} sx={{ gridColumn: { sm: 'span 2' } }} />
              <TextField fullWidth label="Phone" value={b.contactPhone || ''} onChange={(e) => setBrand({ contactPhone: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon fontSize="small" /></InputAdornment> }} />
              <TextField fullWidth label="Email" value={b.contactEmail || ''} onChange={(e) => setBrand({ contactEmail: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon fontSize="small" /></InputAdornment> }} />
            </Box>
          </GlassCard>

          <GlassCard sx={{ p: 3, animation: `${fadeUp} .6s .34s ease-out both` }}>
            <SectionHead icon={<AutoAwesomeIcon />} color="#F59E0B" title="AI persona" subtitle="Injected into itinerary generation for every agent in your organization" />

            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.06em', color: 'text.secondary' }}>DEFAULT ITINERARY STYLE</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 1, mb: 3 }}>
              {STYLES.map((s) => {
                const on = (ai.itineraryStyle || 'LUXURY_EXECUTIVE') === s.v;
                return (
                  <Box key={s.v} role="button" tabIndex={0} onClick={() => setAi({ itineraryStyle: s.v })} onKeyDown={(e) => e.key === 'Enter' && setAi({ itineraryStyle: s.v })}
                    sx={{ p: 1.75, height: 76, borderRadius: '16px', cursor: 'pointer', display: 'flex', gap: 1.5, alignItems: 'center', border: '2px solid', borderColor: on ? s.c : 'divider', bgcolor: on ? `${s.c}12` : 'transparent', transition: 'all .2s', '&:hover': { borderColor: s.c, transform: 'translateY(-2px)' } }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${s.c}, ${s.c}bb)` }}>{s.icon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.35 }}>{s.t}</Typography>
                      <Typography noWrap sx={{ fontSize: '0.78rem', lineHeight: 1.35, color: 'text.secondary' }}>{s.d}</Typography>
                    </Box>
                    {on && <CheckCircleIcon sx={{ color: s.c, ml: 'auto', flexShrink: 0 }} />}
                  </Box>
                );
              })}
            </Box>

            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.06em', color: 'text.secondary' }}>TONE OF VOICE</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 3 }}>
              {TONES.map((t) => {
                const on = (ai.tone || 'ELEGANT') === t.v;
                return (
                  <Chip key={t.v} label={t.t} onClick={() => setAi({ tone: t.v })} color={on ? 'primary' : 'default'} variant={on ? 'filled' : 'outlined'} sx={{ fontWeight: 700, height: 36, px: 0.5 }} />
                );
              })}
            </Stack>

            <TextField
              fullWidth multiline rows={5}
              label="Agency travel policies & prompt instructions"
              placeholder="e.g. Always prioritize 5-star properties, executive airport lounges and private guided excursions."
              value={ai.customInstructions || ''}
              onChange={(e) => setAi({ customInstructions: e.target.value })}
              inputProps={{ maxLength: 1500 }}
              helperText={`${(ai.customInstructions || '').length} / 1500 characters`}
            />
          </GlassCard>

          <GlassCard sx={{ p: 3, animation: `${fadeUp} .6s .42s ease-out both` }}>
            <SectionHead icon={<GroupsOutlinedIcon />} color="#10B981" title="Team" subtitle={`${members.length} member${members.length === 1 ? '' : 's'} in this organization`} />
            {members.length === 0 ? (
              <EmptyState title="No team members yet" description="Agents who join this organization will be listed here with their role." />
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                {members.map((m) => (
                  <Box key={m.userId} sx={{ p: 1.5, height: 68, borderRadius: '14px', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontWeight: 800 }}>{(m.name || m.email || '?').charAt(0).toUpperCase()}</Avatar>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.35 }}>{m.name || m.email}</Typography>
                      <Typography noWrap sx={{ fontSize: '0.74rem', lineHeight: 1.35, color: 'text.secondary' }}>{m.email}</Typography>
                    </Box>
                    <Chip size="small" label={m.role} sx={{ fontWeight: 800, bgcolor: `${roleColor[m.role] || '#94A3B8'}1f`, color: roleColor[m.role] || '#94A3B8' }} />
                  </Box>
                ))}
              </Box>
            )}
          </GlassCard>
        </Stack>

        {/* ───── Right: live PDF preview ───── */}
        <Box sx={{ position: { lg: 'sticky' }, top: { lg: 88 }, animation: `${fadeUp} .6s .2s ease-out both` }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PictureAsPdfIcon sx={{ color: '#EF4444' }} />
              <Typography sx={{ fontWeight: 800 }}>Live PDF preview</Typography>
            </Stack>

            <Box sx={{ borderRadius: '14px', overflow: 'hidden', bgcolor: '#fff', color: '#0F172A', boxShadow: '0 18px 40px -18px rgba(0,0,0,.45)', border: '1px solid rgba(0,0,0,.06)' }}>
              <Box sx={{ p: 2, bgcolor: primary, color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, transition: 'background-color .3s' }}>
                <LogoBox url={b.logoUrl} name={b.companyName || org.name} size={42} radius="12px" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.3, color: '#fff' }}>{b.companyName || org.name}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', opacity: 0.85, lineHeight: 1.35, color: '#fff' }}>{b.headerText || 'Header text'}</Typography>
                </Box>
              </Box>
              <Box sx={{ height: 4, bgcolor: secondary, transition: 'background-color .3s' }} />

              <Box sx={{ p: 2.25 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: primary, lineHeight: 1.3 }}>7 Days in Tokyo</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mb: 1.5 }}>Prepared for Alex Vance · {(STYLES.find((s) => s.v === (ai.itineraryStyle || 'LUXURY_EXECUTIVE')) || STYLES[0]).t}</Typography>
                {['Day 1 — Arrival & private airport transfer', 'Day 2 — Ginza dining & Shinjuku skyline', 'Day 3 — Kyoto day trip by bullet train'].map((d, i) => (
                  <Stack key={d} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i % 2 ? secondary : primary, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#334155' }}>{d}</Typography>
                  </Stack>
                ))}
                <Box sx={{ mt: 1.5 }}>
                  {[90, 70, 82].map((w, i) => <Box key={i} sx={{ height: 6, width: `${w}%`, borderRadius: 3, bgcolor: '#E2E8F0', mb: 0.9 }} />)}
                </Box>
              </Box>

              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderTop: `3px solid ${secondary}`, transition: 'border-color .3s' }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#475569', lineHeight: 1.45, whiteSpace: 'pre-line' }}>{b.footerText || 'Footer & contact details'}</Typography>
                {(b.websiteUrl || b.contactPhone || b.contactEmail) && (
                  <Typography sx={{ fontSize: '0.66rem', color: primary, fontWeight: 700, mt: 0.5, wordBreak: 'break-all' }}>
                    {[b.websiteUrl, b.contactPhone, b.contactEmail].filter(Boolean).join('  ·  ')}
                  </Typography>
                )}
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>Sample itinerary — updates as you edit the brand kit.</Typography>
          </GlassCard>
        </Box>
      </Box>

      {/* Unsaved changes bar */}
      {dirty && (
        <Box sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1300, display: 'flex', alignItems: 'center', gap: 2, pl: 3, pr: 1.5, py: 1.25, borderRadius: '999px', bgcolor: '#111827', color: '#fff', boxShadow: '0 20px 40px -12px rgba(0,0,0,.5)', animation: `${fadeUp} .3s ease-out both` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>You have unsaved changes</Typography>
          <Button size="small" onClick={() => setOrg(JSON.parse(savedSnapshot))} sx={{ color: '#CBD5E1', fontWeight: 700 }}>Discard</Button>
          <Button size="small" variant="contained" onClick={handleSave} disabled={!canSave} sx={{ borderRadius: '999px', fontWeight: 800 }}>{saving ? 'Saving…' : 'Save'}</Button>
        </Box>
      )}
    </Box>
  );
};

export default B2bPortalPage;
