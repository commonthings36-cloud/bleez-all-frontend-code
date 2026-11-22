import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PublishIcon from '@mui/icons-material/Publish';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useSnackbar } from 'notistack';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { TravelHeroArt } from '@/components/Illustrations';
import { apiClient } from '@/services/apiClient';

// ---------------------------------------------------------------------------
// Support Tickets Types & Interfaces
// ---------------------------------------------------------------------------
interface SupportTicketRecord {
  id: string;
  ticketNumber?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  title?: string;
  description?: string;
  bookingId?: string;
  status: string;
  adminNote?: string;
  createdAt?: string;
  resolvedAt?: string;
}

// ---------------------------------------------------------------------------
// Content Management Types & Constants
// ---------------------------------------------------------------------------
const ENDPOINT = '/admin/cms/content';
const DRAFT_KEY = 'bleez-cms-draft-v1';

interface CmsPageDoc {
  id: string;
  title: string;
  body: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt?: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  visible: boolean;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  color: string;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}

interface Content {
  pages: CmsPageDoc[];
  faqs: Faq[];
  banners: Banner[];
}

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
  <Box
    sx={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '16px',
      color: '#fff',
      p: compact ? 2 : 3,
      minHeight: compact ? 130 : 160,
      background: `linear-gradient(120deg, ${shade(b.color, -0.25)} 0%, ${b.color} 55%, ${shade(b.color, 0.28)} 100%)`,
    }}
  >
    <Box sx={{ position: 'absolute', right: -30, top: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.1)' }} />
    <TravelHeroArt sx={{ position: 'absolute', right: 0, bottom: 0, width: compact ? 170 : 240, height: compact ? 110 : 160, opacity: 0.5 }} />
    <Box sx={{ position: 'relative', maxWidth: '65%' }}>
      <Typography sx={{ fontWeight: 800, fontSize: compact ? '1.05rem' : '1.35rem', lineHeight: 1.25 }}>{b.title || 'Your headline'}</Typography>
      <Typography sx={{ opacity: 0.9, fontSize: '0.82rem', mt: 0.5, lineHeight: 1.45 }}>{b.subtitle || 'A short supporting line goes here.'}</Typography>
      {b.cta && (
        <Box
          sx={{
            display: 'inline-block',
            mt: 1.5,
            px: 1.75,
            py: 0.6,
            borderRadius: '9px',
            bgcolor: '#fff',
            color: b.color,
            fontWeight: 800,
            fontSize: '0.78rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          }}
        >
          {b.cta}
        </Box>
      )}
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export const CmsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState<number>(0);

  // -------------------------------------------------------------------------
  // Support Tickets State
  // -------------------------------------------------------------------------
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [ticketLoading, setTicketLoading] = useState<boolean>(false);
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('ALL');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState<string>('');
  const [adminNoteVal, setAdminNoteVal] = useState<string>('');
  const [updatingTicket, setUpdatingTicket] = useState<boolean>(false);

  const fetchTickets = useCallback(() => {
    setTicketLoading(true);
    apiClient
      .get('/admin/support/tickets')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTickets(res.data);
        } else if (res.data && Array.isArray(res.data.tickets)) {
          setTickets(res.data.tickets);
        }
      })
      .catch((err) => {
        console.debug('Failed to fetch admin support tickets:', err.message);
      })
      .finally(() => {
        setTicketLoading(false);
      });
  }, []);

  const handleUpdateTicket = () => {
    if (!selectedTicket) return;
    setUpdatingTicket(true);
    apiClient
      .put(`/admin/support/tickets/${selectedTicket.id}`, {
        status: updateStatusVal,
        adminNote: adminNoteVal,
      })
      .then(() => {
        enqueueSnackbar('Ticket updated successfully', { variant: 'success' });
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? {
                ...t,
                status: updateStatusVal,
                adminNote: adminNoteVal,
                resolvedAt: updateStatusVal === 'RESOLVED' ? new Date().toISOString() : t.resolvedAt,
              }
              : t
          )
        );
        setSelectedTicket(null);
      })
      .catch((err) => {
        enqueueSnackbar(`Failed to update ticket: ${err.message}`, { variant: 'error' });
      })
      .finally(() => {
        setUpdatingTicket(false);
      });
  };

  // -------------------------------------------------------------------------
  // Content State (Pages, FAQs, Banners)
  // -------------------------------------------------------------------------
  const [content, setContent] = useState<Content>(() => loadDraft() || STARTER);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remoteSynced, setRemoteSynced] = useState<boolean | null>(null);

  const [activePageId, setActivePageId] = useState<string>('terms');
  const [faqCategory, setFaqCategory] = useState<string>('ALL');
  const [faqQuery, setFaqQuery] = useState('');
  const [faqEdit, setFaqEdit] = useState<Faq | null>(null);
  const [bannerEdit, setBannerEdit] = useState<Banner | null>(null);

  // Sync draft to local storage
  useEffect(() => {
    saveDraft(content);
  }, [content]);

  // Initial load
  useEffect(() => {
    fetchTickets();

    setLoadingContent(true);
    apiClient
      .get(ENDPOINT)
      .then((res) => {
        if (res.data && Array.isArray(res.data.pages)) {
          setContent(res.data);
          setRemoteSynced(true);
        } else {
          setRemoteSynced(false);
        }
      })
      .catch(() => {
        setRemoteSynced(false);
      })
      .finally(() => setLoadingContent(false));
  }, [fetchTickets]);

  const publishRemote = async () => {
    setSaving(true);
    try {
      await apiClient.put(ENDPOINT, content);
      enqueueSnackbar('Published live to the platform website', { variant: 'success' });
      setRemoteSynced(true);
    } catch {
      enqueueSnackbar('Backend endpoint /admin/cms/content not available yet. Saved locally as a draft.', { variant: 'info' });
      setRemoteSynced(false);
    } finally {
      setSaving(false);
    }
  };

  // Page Handlers
  const activePage = content.pages.find((p) => p.id === activePageId) || content.pages[0];

  const updatePage = (patch: Partial<CmsPageDoc>) => {
    setContent((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === activePageId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
      ),
    }));
  };

  // FAQ Handlers
  const filteredFaqs = useMemo(() => {
    return content.faqs.filter((f) => {
      const matchCat = faqCategory === 'ALL' || f.category === faqCategory;
      const matchQuery =
        !faqQuery.trim() ||
        f.question.toLowerCase().includes(faqQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(faqQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [content.faqs, faqCategory, faqQuery]);

  const saveFaq = () => {
    if (!faqEdit) return;
    setContent((prev) => {
      const exists = prev.faqs.some((f) => f.id === faqEdit.id);
      const next = exists ? prev.faqs.map((f) => (f.id === faqEdit.id ? faqEdit : f)) : [faqEdit, ...prev.faqs];
      return { ...prev, faqs: next };
    });
    setFaqEdit(null);
    enqueueSnackbar('FAQ saved', { variant: 'success' });
  };

  const moveFaq = (id: string, dir: -1 | 1) => {
    setContent((prev) => {
      const idx = prev.faqs.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.faqs.length) return prev;
      const copy = [...prev.faqs];
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      return { ...prev, faqs: copy };
    });
  };

  const deleteFaq = (id: string) => {
    setContent((prev) => ({ ...prev, faqs: prev.faqs.filter((f) => f.id !== id) }));
  };

  const toggleFaq = (id: string) => {
    setContent((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)),
    }));
  };

  // Banner Handlers
  const saveBanner = () => {
    if (!bannerEdit) return;
    setContent((prev) => {
      const exists = prev.banners.some((b) => b.id === bannerEdit.id);
      const next = exists
        ? prev.banners.map((b) => (b.id === bannerEdit.id ? bannerEdit : b))
        : [bannerEdit, ...prev.banners];
      return { ...prev, banners: next };
    });
    setBannerEdit(null);
    enqueueSnackbar('Banner saved', { variant: 'success' });
  };

  const deleteBanner = (id: string) => {
    setContent((prev) => ({ ...prev, banners: prev.banners.filter((b) => b.id !== id) }));
  };

  const toggleBanner = (id: string) => {
    setContent((prev) => ({
      ...prev,
      banners: prev.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    }));
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
      const matchCat = ticketCategoryFilter === 'ALL' || t.category === ticketCategoryFilter;
      const q = ticketSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.title && t.title.toLowerCase().includes(q));
      return matchStatus && matchCat && matchSearch;
    });
  }, [tickets, ticketStatusFilter, ticketCategoryFilter, ticketSearch]);

  // Support Tickets Columns
  const ticketCols: GridColDef[] = [
    {
      field: 'ticketNumber',
      headerName: 'Ticket #',
      width: 130,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'primary.main' }}>
          {params.value || `#${params.row.id?.slice(-6)}`}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Requester',
      width: 180,
      renderCell: (params) => (
        <Stack spacing={0.2} sx={{ py: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{params.value || 'Anonymous'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email || '—'}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || 'General'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
        />
      ),
    },
    {
      field: 'title',
      headerName: 'Subject',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }} noWrap>
          {params.value || params.row.description || '—'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const val = (params.value || 'OPEN').toUpperCase();
        const colorMap: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
          OPEN: 'warning',
          IN_PROGRESS: 'info',
          RESOLVED: 'success',
          CLOSED: 'default',
        };
        const iconMap: Record<string, React.ReactElement> = {
          OPEN: <HourglassTopIcon sx={{ fontSize: 14 }} />,
          IN_PROGRESS: <HourglassTopIcon sx={{ fontSize: 14 }} />,
          RESOLVED: <CheckCircleIcon sx={{ fontSize: 14 }} />,
          CLOSED: <CancelIcon sx={{ fontSize: 14 }} />,
        };
        return (
          <Chip
            size="small"
            color={colorMap[val] || 'default'}
            icon={iconMap[val]}
            label={val}
            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 130,
      valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '—'),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
          onClick={() => {
            setSelectedTicket(params.row);
            setUpdateStatusVal(params.row.status || 'OPEN');
            setAdminNoteVal(params.row.adminNote || '');
          }}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', fontSize: '0.75rem' }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ animation: `${fadeUp} .35s ease-out` }}>
      <PageHeader
        title="CMS & Support Management"
        subtitle="Manage traveler support tickets, knowledgebase FAQs, policy pages, and live promo hero banners."
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'CMS & Support' }]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            {remoteSynced === false && (
              <Chip
                icon={<CloudOffIcon sx={{ fontSize: 16 }} />}
                label="Drafts kept locally"
                size="small"
                variant="outlined"
                color="warning"
                sx={{ fontWeight: 700 }}
              />
            )}
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <PublishIcon />}
              onClick={publishRemote}
              disabled={saving}
              sx={{ fontWeight: 800, textTransform: 'none', borderRadius: '10px' }}
            >
              {saving ? 'Publishing...' : 'Publish Content'}
            </Button>
          </Stack>
        }
      />

      {/* Tabs navigation */}
      <GlassCard sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              minHeight: 56,
              fontSize: '0.9rem',
            },
          }}
        >
          <Tab
            icon={<SupportAgentIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Support Tickets</span>
                <Chip
                  label={tickets.filter((t) => t.status === 'OPEN').length}
                  size="small"
                  color="warning"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }}
                />
              </Stack>
            }
          />
          <Tab
            icon={<ArticleOutlinedIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Site Pages (${content.pages.length})`}
          />
          <Tab
            icon={<HelpOutlineIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`FAQs (${content.faqs.length})`}
          />
          <Tab
            icon={<ViewCarouselOutlinedIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Promo Banners (${content.banners.length})`}
          />
        </Tabs>
      </GlassCard>

      {/* ----------------------------------------------------------------- */}
      {/* TAB 0: Support Tickets                                            */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 0 && (
        <GlassCard sx={{ p: 3 }}>
          {/* Filter Bar */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ mb: 3 }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flex={1}>
              <TextField
                size="small"
                placeholder="Search ticket #, user name, subject..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 260 }}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={ticketStatusFilter}
                  label="Status"
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={ticketCategoryFilter}
                  label="Category"
                  onChange={(e) => setTicketCategoryFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Categories</MenuItem>
                  <MenuItem value="Flights">Flights</MenuItem>
                  <MenuItem value="Hotels">Hotels</MenuItem>
                  <MenuItem value="Itinerary">Itinerary</MenuItem>
                  <MenuItem value="Payments">Payments</MenuItem>
                  <MenuItem value="Cancellation">Cancellation</MenuItem>
                  <MenuItem value="Account">Account</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchTickets}
              disabled={ticketLoading}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Refresh Tickets
            </Button>
          </Stack>

          {/* Tickets DataGrid */}
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filteredTickets}
              columns={ticketCols}
              loading={ticketLoading}
              getRowId={(row) => row.id || row.ticketNumber || String(Math.random())}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
              }}
            />
          </Box>
        </GlassCard>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: Site Pages                                                 */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 1 && (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '280px 1fr' } }}>
          {/* Page list column */}
          <GlassCard sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0.8 }}>
              Standard Legal Pages
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {content.pages.map((p) => {
                const isSelected = p.id === activePageId;
                return (
                  <Box
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActivePageId(p.id)}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? '#fff' : 'text.primary',
                      transition: 'all .15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.title}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip
                        label={p.status}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : undefined,
                          color: isSelected ? '#fff' : undefined,
                        }}
                      />
                      <Typography sx={{ fontSize: '0.72rem', opacity: isSelected ? 0.9 : 0.6 }}>
                        {fmt(p.updatedAt)}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </GlassCard>

          {/* Active page editor */}
          <GlassCard sx={{ p: 3 }}>
            {activePage && (
              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{activePage.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last saved: {fmt(activePage.updatedAt)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Status:
                    </Typography>
                    <ToggleButtonGroup
                      size="small"
                      value={activePage.status}
                      exclusive
                      onChange={(_, val) => val && updatePage({ status: val })}
                    >
                      <ToggleButton value="DRAFT" sx={{ fontWeight: 700, px: 1.5 }}>
                        Draft
                      </ToggleButton>
                      <ToggleButton value="PUBLISHED" sx={{ fontWeight: 700, px: 1.5 }}>
                        Published
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </Stack>

                <TextField
                  label="Page Title"
                  value={activePage.title}
                  onChange={(e) => updatePage({ title: e.target.value })}
                  fullWidth
                  size="small"
                />

                <TextField
                  label="Content (Markdown supported)"
                  value={activePage.body}
                  onChange={(e) => updatePage({ body: e.target.value })}
                  multiline
                  minRows={14}
                  fullWidth
                  placeholder="Write terms, privacy policy, or about us content here in Markdown format..."
                />
              </Stack>
            )}
          </GlassCard>
        </Box>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: FAQs                                                       */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 2 && (
        <GlassCard sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={1.5} flex={1}>
              <TextField
                size="small"
                placeholder="Search FAQs..."
                value={faqQuery}
                onChange={(e) => setFaqQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 300 }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={faqCategory}
                  label="Category"
                  onChange={(e) => setFaqCategory(e.target.value)}
                >
                  <MenuItem value="ALL">All Categories</MenuItem>
                  {FAQ_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                setFaqEdit({
                  id: uid(),
                  question: '',
                  answer: '',
                  category: FAQ_CATEGORIES[0],
                  visible: true,
                })
              }
              sx={{ fontWeight: 800, textTransform: 'none', borderRadius: '10px' }}
            >
              New FAQ
            </Button>
          </Stack>

          {filteredFaqs.length === 0 ? (
            <EmptyState
              icon={<HelpOutlineIcon sx={{ fontSize: 44, color: 'text.secondary' }} />}
              title="No FAQs found"
              description="Create a new FAQ to help travelers find answers quickly."
            />
          ) : (
            <Stack spacing={1.5}>
              {filteredFaqs.map((faq, idx) => (
                <Box
                  key={faq.id}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Chip label={faq.category} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                      {!faq.visible && (
                        <Chip label="Hidden" size="small" color="default" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                      )}
                    </Stack>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>{faq.question}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }} noWrap>
                      {faq.answer}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title="Move Up">
                      <span>
                        <IconButton size="small" onClick={() => moveFaq(faq.id, -1)} disabled={idx === 0}>
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move Down">
                      <span>
                        <IconButton size="small" onClick={() => moveFaq(faq.id, 1)} disabled={idx === filteredFaqs.length - 1}>
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Switch checked={faq.visible} onChange={() => toggleFaq(faq.id)} size="small" />
                    <IconButton size="small" onClick={() => setFaqEdit(faq)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteFaq(faq.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </GlassCard>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: Promo Banners                                              */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 3 && (
        <GlassCard sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Promo Hero Banners</Typography>
              <Typography variant="body2" color="text.secondary">
                Configure promotional banners with custom gradients and direct call-to-actions.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                setBannerEdit({
                  id: uid(),
                  title: '',
                  subtitle: '',
                  cta: 'Explore Now',
                  link: '/plan-trip',
                  color: BANNER_COLORS[0],
                  active: true,
                })
              }
              sx={{ fontWeight: 800, textTransform: 'none', borderRadius: '10px' }}
            >
              New Banner
            </Button>
          </Stack>

          {content.banners.length === 0 ? (
            <EmptyState
              icon={<CampaignOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary' }} />}
              title="No promo banners created"
              description="Add your first promotional banner to display in the website hero section."
            />
          ) : (
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              {content.banners.map((b) => (
                <Box
                  key={b.id}
                  sx={{
                    p: 2.5,
                    borderRadius: '18px',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <BannerPreview b={b} compact />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch checked={b.active} onChange={() => toggleBanner(b.id)} size="small" />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {b.active ? 'Active' : 'Inactive'}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<EditOutlinedIcon />}
                        onClick={() => setBannerEdit(b)}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Edit
                      </Button>
                      <IconButton size="small" color="error" onClick={() => deleteBanner(b.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </GlassCard>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Dialogs                                                           */}
      {/* ----------------------------------------------------------------- */}

      {/* Ticket Details & Resolution Dialog */}
      <Dialog
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Ticket #{selectedTicket?.ticketNumber || selectedTicket?.id?.slice(-6)}
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Stack spacing={2.5}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Requester
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{selectedTicket.name || 'Anonymous'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTicket.email || '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{selectedTicket.category || 'General'}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Subject
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{selectedTicket.title}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover', mt: 0.5 }}>
                  <Typography sx={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedTicket.description}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Submitted: {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : '—'}
                </Typography>
              </Box>

              <Divider />

              {/* Status Update Form */}
              <Stack spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={updateStatusVal}
                    label="Status"
                    onChange={(e) => setUpdateStatusVal(e.target.value)}
                  >
                    <MenuItem value="OPEN">OPEN</MenuItem>
                    <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
                    <MenuItem value="RESOLVED">RESOLVED</MenuItem>
                    <MenuItem value="CLOSED">CLOSED</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  multiline
                  rows={3}
                  label="Admin Note / Resolution Notes"
                  placeholder="Enter notes about how this ticket was resolved..."
                  value={adminNoteVal}
                  onChange={(e) => setAdminNoteVal(e.target.value)}
                  fullWidth
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSelectedTicket(null)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={handleUpdateTicket}
            disabled={updatingTicket}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            {updatingTicket ? 'Saving...' : 'Save & Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog
        open={Boolean(faqEdit)}
        onClose={() => setFaqEdit(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <Box sx={{ p: 3, color: '#fff', background: 'linear-gradient(120deg,#4C1D95,#0EA5E9)' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
            {faqEdit && content.faqs.some((f) => f.id === faqEdit.id) ? 'Edit FAQ' : 'New FAQ'}
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          {faqEdit && (
            <Stack spacing={2}>
              <TextField
                label="Question"
                fullWidth
                value={faqEdit.question}
                onChange={(e) => setFaqEdit({ ...faqEdit, question: e.target.value })}
                autoFocus
              />
              <TextField
                label="Answer"
                fullWidth
                multiline
                minRows={4}
                value={faqEdit.answer}
                onChange={(e) => setFaqEdit({ ...faqEdit, answer: e.target.value })}
              />
              <TextField
                select
                label="Category"
                value={faqEdit.category}
                onChange={(e) => setFaqEdit({ ...faqEdit, category: e.target.value })}
              >
                {FAQ_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setFaqEdit(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveFaq}
            disabled={!faqEdit?.question.trim() || !faqEdit?.answer.trim()}
            sx={{ fontWeight: 800 }}
          >
            Save FAQ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog
        open={Boolean(bannerEdit)}
        onClose={() => setBannerEdit(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <Box sx={{ p: 3, color: '#fff', background: 'linear-gradient(120deg,#4C1D95,#F97316)' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
            {bannerEdit && content.banners.some((b) => b.id === bannerEdit.id) ? 'Edit Banner' : 'New Banner'}
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          {bannerEdit && (
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Stack spacing={2}>
                <TextField
                  label="Headline"
                  fullWidth
                  value={bannerEdit.title}
                  onChange={(e) => setBannerEdit({ ...bannerEdit, title: e.target.value })}
                  autoFocus
                />
                <TextField
                  label="Supporting line"
                  fullWidth
                  multiline
                  minRows={2}
                  value={bannerEdit.subtitle}
                  onChange={(e) => setBannerEdit({ ...bannerEdit, subtitle: e.target.value })}
                />
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="Button text"
                    value={bannerEdit.cta}
                    onChange={(e) => setBannerEdit({ ...bannerEdit, cta: e.target.value })}
                  />
                  <TextField
                    label="Button link"
                    fullWidth
                    placeholder="/plan-trip"
                    value={bannerEdit.link}
                    onChange={(e) => setBannerEdit({ ...bannerEdit, link: e.target.value })}
                  />
                </Stack>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', mb: 0.75 }}>Color</Typography>
                  <Stack direction="row" spacing={1}>
                    {BANNER_COLORS.map((c) => (
                      <Box
                        key={c}
                        role="button"
                        tabIndex={0}
                        aria-label={`Color ${c}`}
                        onClick={() => setBannerEdit({ ...bannerEdit, color: c })}
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '10px',
                          bgcolor: c,
                          cursor: 'pointer',
                          border: '3px solid',
                          borderColor: bannerEdit.color === c ? 'text.primary' : 'transparent',
                          transition: 'transform .15s',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="Starts"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={bannerEdit.startsAt || ''}
                    onChange={(e) => setBannerEdit({ ...bannerEdit, startsAt: e.target.value })}
                  />
                  <TextField
                    label="Ends"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={bannerEdit.endsAt || ''}
                    onChange={(e) => setBannerEdit({ ...bannerEdit, endsAt: e.target.value })}
                  />
                </Stack>
              </Stack>
              <Box>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', mb: 1 }}
                >
                  Live preview
                </Typography>
                <BannerPreview b={bannerEdit} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setBannerEdit(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveBanner}
            disabled={!bannerEdit?.title.trim()}
            sx={{ fontWeight: 800 }}
          >
            Save Banner
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
