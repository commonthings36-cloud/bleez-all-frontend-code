import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, MenuItem, Stack, Switch,
  Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, keyframes,
} from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PublishIcon from '@mui/icons-material/Publish';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { TravelHeroArt } from '@/components/Illustrations';
import { apiClient } from '@/services/apiClient';

/**
 * WHERE THE DATA HITS
 *   GET /admin/cms/content  -> { pages: Page[], faqs: Faq[], banners: Banner[] }
 *   PUT /admin/cms/content  -> same body (publishes everything)
 * Until the backend has these, edits are kept as drafts in this browser only (shown clearly on the page).
 */
const ENDPOINT = '/admin/cms/content';
const DRAFT_KEY = 'bleez-cms-draft-v1';

interface CmsPage { id: string; title: string; body: string; status: 'DRAFT' | 'PUBLISHED'; updatedAt?: string }
interface Faq { id: string; question: string; answer: string; category: string; visible: boolean }
interface Banner { id: string; title: string; subtitle: string; cta: string; link: string; color: string; active: boolean; startsAt?: string; endsAt?: string }
interface Content { pages: CmsPage[]; faqs: Faq[]; banners: Banner[] }

const STARTER: Content = {
  pages: [
    { id: 'terms', title: 'Terms of Service', body: '', status: 'DRAFT' },
    { id: 'privacy', title: 'Privacy Policy', body: '', status: 'DRAFT' },
    { id: 'about', title: 'About Bleez', body: '', status: 'DRAFT' },
    { id: 'refund', title: 'Refund & Cancellation Policy', body: '', status: 'DRAFT' },
  ],
  faqs: [],
  banners: [],
};

const FAQ_CATEGORIES = ['General', 'Trips & AI', 'Bookings', 'Payments', 'Safety', 'Account'];
const BANNER_COLORS = ['#7C3AED', '#2563EB', '#0EA5E9', '#F97316', '#DB2777', '#16A34A'];

const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (v?: string) => (v ? new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const loadDraft = (): Content | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Content) : null;
  } catch {
    return null;
  }
};
const saveDraft = (c: Content) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable: edits stay in memory only */
  }
};

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

const BannerPreview: React.FC<{ b: Pick<Banner, 'title' | 'subtitle' | 'cta' | 'color'>; compact?: boolean }> = ({ b, compact }) => (
  <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', color: '#fff', p: compact ? 2 : 3, minHeight: compact ? 130 : 160, background: `linear-gradient(120deg, ${shade(b.color, -0.25)} 0%, ${b.color} 55%, ${shade(b.color, 0.28)} 100%)` }}>
    <Box sx={{ position: 'absolute', right: -30, top: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.1)' }} />
    <TravelHeroArt sx={{ position: 'absolute', right: 0, bottom: 0, width: compact ? 170 : 240, height: compact ? 110 : 160, opacity: 0.5 }} />
    <Box sx={{ position: 'relative', maxWidth: '65%' }}>
      <Typography sx={{ fontWeight: 800, fontSize: compact ? '1.05rem' : '1.35rem', lineHeight: 1.25 }}>{b.title || 'Your headline'}</Typography>
      <Typography sx={{ opacity: 0.9, fontSize: '0.82rem', mt: 0.5, lineHeight: 1.45 }}>{b.subtitle || 'A short supporting line goes here.'}</Typography>
      {b.cta && <Box sx={{ display: 'inline-block', mt: 1.5, px: 1.75, py: 0.6, borderRadius: '9px', bgcolor: '#fff', color: b.color, fontWeight: 800, fontSize: '0.8rem' }}>{b.cta}</Box>}
    </Box>
  </Box>
);

export const CmsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [content, setContent] = useState<Content>(STARTER);
  const [live, setLive] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [tab, setTab] = useState<'pages' | 'faqs' | 'banners'>('pages');
  const [pageId, setPageId] = useState('terms');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [faqEdit, setFaqEdit] = useState<Faq | null>(null);
  const [bannerEdit, setBannerEdit] = useState<Banner | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINT);
      const d = res.data || {};
      setContent({ pages: d.pages?.length ? d.pages : STARTER.pages, faqs: d.faqs || [], banners: d.banners || [] });
      setLive('connected');
      setDirty(false);
    } catch {
      setLive('offline');
      setContent(loadDraft() || STARTER);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Every edit goes through here so drafts are never lost. */
  const update = (fn: (c: Content) => Content) => {
    setContent((prev) => {
      const next = fn(prev);
      saveDraft(next);
      return next;
    });
    setDirty(true);
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const stamped = { ...content, pages: content.pages.map((p) => (p.status === 'PUBLISHED' ? { ...p, updatedAt: new Date().toISOString() } : p)) };
      await apiClient.put(ENDPOINT, stamped);
      setContent(stamped);
      setLive('connected');
      setDirty(false);
      enqueueSnackbar('Content published', { variant: 'success' });
    } catch (e: any) {
      const nf = e?.response?.status === 404 || e?.response?.status === 405;
      enqueueSnackbar(nf ? 'The backend CMS endpoint is not live yet. Your edits are safe as a draft in this browser.' : e?.response?.data?.message || 'Could not publish', { variant: 'warning' });
    } finally {
      setPublishing(false);
    }
  };

  const page = content.pages.find((p) => p.id === pageId) || content.pages[0];
  const setPage = (patch: Partial<CmsPage>) => update((c) => ({ ...c, pages: c.pages.map((p) => (p.id === page.id ? { ...p, ...patch } : p)) }));

  const stats = useMemo(() => [
    { label: 'Pages live', value: content.pages.filter((p) => p.status === 'PUBLISHED').length, sub: `of ${content.pages.length} documents`, color: '#7C3AED', icon: <ArticleOutlinedIcon /> },
    { label: 'FAQs shown', value: content.faqs.filter((f) => f.visible).length, sub: `${content.faqs.length} written`, color: '#0EA5E9', icon: <HelpOutlineIcon /> },
    { label: 'Active banners', value: content.banners.filter((b) => b.active).length, sub: `${content.banners.length} created`, color: '#F97316', icon: <ViewCarouselOutlinedIcon /> },
    { label: 'Unpublished', value: dirty ? 'Yes' : 'No', sub: dirty ? 'Changes waiting to go live' : 'Everything is up to date', color: dirty ? '#F59E0B' : '#16A34A', icon: <PublishIcon /> },
  ], [content, dirty]);

  const moveFaq = (id: string, dir: -1 | 1) => update((c) => {
    const i = c.faqs.findIndex((f) => f.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= c.faqs.length) return c;
    const next = [...c.faqs];
    [next[i], next[j]] = [next[j], next[i]];
    return { ...c, faqs: next };
  });

  const saveFaq = () => {
    if (!faqEdit || !faqEdit.question.trim() || !faqEdit.answer.trim()) return;
    update((c) => ({ ...c, faqs: c.faqs.some((f) => f.id === faqEdit.id) ? c.faqs.map((f) => (f.id === faqEdit.id ? faqEdit : f)) : [...c.faqs, faqEdit] }));
    setFaqEdit(null);
  };
  const saveBanner = () => {
    if (!bannerEdit || !bannerEdit.title.trim()) return;
    update((c) => ({ ...c, banners: c.banners.some((b) => b.id === bannerEdit.id) ? c.banners.map((b) => (b.id === bannerEdit.id ? bannerEdit : b)) : [...c.banners, bannerEdit] }));
    setBannerEdit(null);
  };

  return (
    <Box>
      <PageHeader
        title="CMS & Content"
        subtitle="Write the legal pages, FAQs and promo banners that users see in the app and on the website"
        breadcrumbs={[{ label: 'Content' }, { label: 'CMS' }]}
        action={
          <Button variant="contained" startIcon={publishing ? <CircularProgress size={16} color="inherit" /> : <PublishIcon />} onClick={publish} disabled={publishing || !dirty} sx={{ fontWeight: 800 }}>
            Publish changes
          </Button>
        }
      />

      {live === 'offline' && (
        <Alert severity="info" icon={<CloudOffIcon />} sx={{ mb: 2.5, borderRadius: '14px' }}>
          The CMS endpoint (<b style={{ fontFamily: 'monospace' }}>{ENDPOINT}</b>) is not live on the backend yet. You can write and edit freely; everything is kept as a <b>draft in this browser</b> and will go live when the backend is ready.
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 2, mb: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' } }}>
        {stats.map((k, i) => (
          <GlassCard key={k.label} sx={{ p: 2.5, height: 122, animation: `${fadeUp} .45s ease ${i * 0.07}s both` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{k.label}</Typography>
                <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.3, color: k.color }}>{k.value}</Typography>
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: `${k.color}1a`, color: k.color }}>{k.icon}</Box>
            </Stack>
            <Typography noWrap color="text.secondary" sx={{ fontSize: '0.8rem' }}>{k.sub}</Typography>
          </GlassCard>
        ))}
      </Box>

      <GlassCard sx={{ animation: `${fadeUp} .5s ease .25s both` }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2.5, pt: 1.5, minHeight: 44 }}>
          <Tab value="pages" icon={<ArticleOutlinedIcon fontSize="small" />} iconPosition="start" label="Pages" sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }} />
          <Tab value="faqs" icon={<HelpOutlineIcon fontSize="small" />} iconPosition="start" label={`FAQs (${content.faqs.length})`} sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }} />
          <Tab value="banners" icon={<ViewCarouselOutlinedIcon fontSize="small" />} iconPosition="start" label={`Banners (${content.banners.length})`} sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }} />
        </Tabs>

        <Box sx={{ p: 2.5 }}>
          {/* ------------------------------ PAGES ------------------------------ */}
          {tab === 'pages' && page && (
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '260px 1fr' }, alignItems: 'start' }}>
              <Stack spacing={1}>
                {content.pages.map((p) => {
                  const on = p.id === page.id;
                  const pub = p.status === 'PUBLISHED';
                  return (
                    <Box key={p.id} role="button" tabIndex={0} onClick={() => setPageId(p.id)} onKeyDown={(e) => e.key === 'Enter' && setPageId(p.id)} sx={{ p: 1.5, borderRadius: '12px', cursor: 'pointer', border: '1px solid', borderColor: on ? 'primary.main' : 'divider', bgcolor: on ? 'rgba(124,58,237,.1)' : 'transparent', transition: 'all .2s', '&:hover': { borderColor: 'primary.main' } }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.35 }}>{p.title}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip size="small" label={pub ? 'Published' : 'Draft'} sx={{ height: 20, borderRadius: '6px', fontWeight: 700, fontSize: '0.66rem', bgcolor: pub ? 'rgba(22,163,74,.14)' : 'rgba(245,158,11,.16)', color: pub ? '#16A34A' : '#D97706' }} />
                        <Typography color="text.secondary" sx={{ fontSize: '0.7rem' }}>{p.body.trim() ? `${p.body.trim().split(/\s+/).length} words` : 'Empty'}</Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>

              <Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 1.5 }}>
                  <TextField size="small" label="Page title" value={page.title} onChange={(e) => setPage({ title: e.target.value })} sx={{ flex: 1, maxWidth: 420 }} />
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ToggleButtonGroup size="small" exclusive value={mode} onChange={(_, v) => v && setMode(v)}>
                      <ToggleButton value="edit" sx={{ px: 2, fontWeight: 700, textTransform: 'none' }}>Write</ToggleButton>
                      <ToggleButton value="preview" sx={{ px: 2, fontWeight: 700, textTransform: 'none' }}>Preview</ToggleButton>
                    </ToggleButtonGroup>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: page.status === 'PUBLISHED' ? '#16A34A' : 'text.secondary' }}>{page.status === 'PUBLISHED' ? 'Live' : 'Draft'}</Typography>
                      <Switch checked={page.status === 'PUBLISHED'} onChange={(e) => setPage({ status: e.target.checked ? 'PUBLISHED' : 'DRAFT' })} />
                    </Stack>
                  </Stack>
                </Stack>
                {mode === 'edit' ? (
                  <TextField multiline minRows={14} maxRows={22} fullWidth placeholder={`Write "${page.title}" here. Use a blank line between paragraphs and "# " at the start of a line for headings.`} value={page.body} onChange={(e) => setPage({ body: e.target.value })} />
                ) : (
                  <Box sx={{ minHeight: 330, p: 3, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', mb: 2 }}>{page.title}</Typography>
                    {page.body.trim() ? page.body.split(/\n{2,}/).map((para, i) => (
                      para.startsWith('# ')
                        ? <Typography key={i} sx={{ fontWeight: 800, fontSize: '1.15rem', mt: 2.5, mb: 1 }}>{para.slice(2)}</Typography>
                        : <Typography key={i} sx={{ mb: 1.5, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{para}</Typography>
                    )) : <EmptyState title="Nothing written yet" description="Switch to Write and add the content." />}
                  </Box>
                )}
                <Typography color="text.secondary" sx={{ fontSize: '0.76rem', mt: 1 }}>Last published: {fmt(page.updatedAt)}</Typography>
              </Box>
            </Box>
          )}

          {/* ------------------------------- FAQS ------------------------------ */}
          {tab === 'faqs' && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.86rem' }}>Shown to users in this order. Use the arrows to reorder.</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFaqEdit({ id: uid(), question: '', answer: '', category: 'General', visible: true })} sx={{ fontWeight: 700 }}>Add FAQ</Button>
              </Stack>
              {content.faqs.length === 0 ? (
                <EmptyState icon={<HelpOutlineIcon />} title="No FAQs yet" description="Answer the questions users ask most often." actionLabel="Write the first FAQ" onAction={() => setFaqEdit({ id: uid(), question: '', answer: '', category: 'General', visible: true })} />
              ) : (
                <Stack spacing={1.25}>
                  {content.faqs.map((f, i) => (
                    <Stack key={f.id} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.75, borderRadius: '14px', border: '1px solid', borderColor: 'divider', opacity: f.visible ? 1 : 0.55, animation: `${fadeUp} .35s ease ${i * 0.03}s both` }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: '10px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(14,165,233,.14)', color: '#0EA5E9', fontWeight: 800, fontSize: '0.85rem' }}>{i + 1}</Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.4 }}>{f.question}</Typography>
                        <Typography noWrap color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{f.answer}</Typography>
                      </Box>
                      <Chip size="small" label={f.category} sx={{ display: { xs: 'none', sm: 'inline-flex' }, height: 24, borderRadius: '7px', fontWeight: 700, fontSize: '0.7rem' }} />
                      <Tooltip title={f.visible ? 'Visible to users' : 'Hidden'}><Switch size="small" checked={f.visible} onChange={(e) => update((c) => ({ ...c, faqs: c.faqs.map((x) => (x.id === f.id ? { ...x, visible: e.target.checked } : x)) }))} /></Tooltip>
                      <IconButton size="small" disabled={i === 0} onClick={() => moveFaq(f.id, -1)} aria-label="Move up"><ArrowUpwardIcon fontSize="small" /></IconButton>
                      <IconButton size="small" disabled={i === content.faqs.length - 1} onClick={() => moveFaq(f.id, 1)} aria-label="Move down"><ArrowDownwardIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => setFaqEdit(f)} aria-label="Edit"><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => update((c) => ({ ...c, faqs: c.faqs.filter((x) => x.id !== f.id) }))} aria-label="Delete"><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* ----------------------------- BANNERS ----------------------------- */}
          {tab === 'banners' && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.86rem' }}>Hero banners shown on the home screen. Only active ones are displayed.</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBannerEdit({ id: uid(), title: '', subtitle: '', cta: 'Explore', link: '', color: BANNER_COLORS[0], active: true })} sx={{ fontWeight: 700 }}>New banner</Button>
              </Stack>
              {content.banners.length === 0 ? (
                <EmptyState icon={<CampaignOutlinedIcon />} title="No banners yet" description="Promote an offer or a destination with a hero banner." actionLabel="Create a banner" onAction={() => setBannerEdit({ id: uid(), title: '', subtitle: '', cta: 'Explore', link: '', color: BANNER_COLORS[0], active: true })} />
              ) : (
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2,1fr)' } }}>
                  {content.banners.map((b, i) => (
                    <Box key={b.id} sx={{ p: 1.5, borderRadius: '18px', border: '1px solid', borderColor: 'divider', animation: `${fadeUp} .4s ease ${i * 0.05}s both` }}>
                      <Box sx={{ opacity: b.active ? 1 : 0.5 }}><BannerPreview b={b} compact /></Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25, px: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Switch size="small" checked={b.active} onChange={(e) => update((c) => ({ ...c, banners: c.banners.map((x) => (x.id === b.id ? { ...x, active: e.target.checked } : x)) }))} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: b.active ? '#16A34A' : 'text.secondary' }}>{b.active ? 'Showing' : 'Hidden'}</Typography>
                        </Stack>
                        <Box>
                          <IconButton size="small" onClick={() => setBannerEdit(b)} aria-label="Edit"><EditOutlinedIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => update((c) => ({ ...c, banners: c.banners.filter((x) => x.id !== b.id) }))} aria-label="Delete"><DeleteOutlineIcon fontSize="small" /></IconButton>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </GlassCard>

      {/* FAQ dialog */}
      <Dialog open={Boolean(faqEdit)} onClose={() => setFaqEdit(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <Box sx={{ p: 3, color: '#fff', background: 'linear-gradient(120deg,#4C1D95,#0EA5E9)' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>{faqEdit && content.faqs.some((f) => f.id === faqEdit.id) ? 'Edit FAQ' : 'New FAQ'}</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          {faqEdit && (
            <Stack spacing={2}>
              <TextField label="Question" fullWidth value={faqEdit.question} onChange={(e) => setFaqEdit({ ...faqEdit, question: e.target.value })} autoFocus />
              <TextField label="Answer" fullWidth multiline minRows={4} value={faqEdit.answer} onChange={(e) => setFaqEdit({ ...faqEdit, answer: e.target.value })} />
              <TextField select label="Category" value={faqEdit.category} onChange={(e) => setFaqEdit({ ...faqEdit, category: e.target.value })}>
                {FAQ_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setFaqEdit(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveFaq} disabled={!faqEdit?.question.trim() || !faqEdit?.answer.trim()} sx={{ fontWeight: 800 }}>Save FAQ</Button>
        </DialogActions>
      </Dialog>

      {/* Banner dialog with live preview */}
      <Dialog open={Boolean(bannerEdit)} onClose={() => setBannerEdit(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <Box sx={{ p: 3, color: '#fff', background: 'linear-gradient(120deg,#4C1D95,#F97316)' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>{bannerEdit && content.banners.some((b) => b.id === bannerEdit.id) ? 'Edit banner' : 'New banner'}</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          {bannerEdit && (
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Stack spacing={2}>
                <TextField label="Headline" fullWidth value={bannerEdit.title} onChange={(e) => setBannerEdit({ ...bannerEdit, title: e.target.value })} autoFocus />
                <TextField label="Supporting line" fullWidth multiline minRows={2} value={bannerEdit.subtitle} onChange={(e) => setBannerEdit({ ...bannerEdit, subtitle: e.target.value })} />
                <Stack direction="row" spacing={1.5}>
                  <TextField label="Button text" value={bannerEdit.cta} onChange={(e) => setBannerEdit({ ...bannerEdit, cta: e.target.value })} />
                  <TextField label="Button link" fullWidth placeholder="/plan-trip" value={bannerEdit.link} onChange={(e) => setBannerEdit({ ...bannerEdit, link: e.target.value })} />
                </Stack>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', mb: 0.75 }}>Colour</Typography>
                  <Stack direction="row" spacing={1}>
                    {BANNER_COLORS.map((c) => (
                      <Box key={c} role="button" tabIndex={0} aria-label={`Colour ${c}`} onClick={() => setBannerEdit({ ...bannerEdit, color: c })} sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: c, cursor: 'pointer', border: '3px solid', borderColor: bannerEdit.color === c ? 'text.primary' : 'transparent', transition: 'transform .15s', '&:hover': { transform: 'scale(1.1)' } }} />
                    ))}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <TextField label="Starts" type="date" InputLabelProps={{ shrink: true }} value={bannerEdit.startsAt || ''} onChange={(e) => setBannerEdit({ ...bannerEdit, startsAt: e.target.value })} />
                  <TextField label="Ends" type="date" InputLabelProps={{ shrink: true }} value={bannerEdit.endsAt || ''} onChange={(e) => setBannerEdit({ ...bannerEdit, endsAt: e.target.value })} />
                </Stack>
              </Stack>
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', mb: 1 }}>Live preview</Typography>
                <BannerPreview b={bannerEdit} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setBannerEdit(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveBanner} disabled={!bannerEdit?.title.trim()} sx={{ fontWeight: 800 }}>Save banner</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
