import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Divider,
  keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useSnackbar } from 'notistack';

import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

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

interface FaqItem {
  id?: string;
  category: string;
  question: string;
  answer: string;
}

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;

export const CmsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState<number>(0);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [ticketLoading, setTicketLoading] = useState<boolean>(false);
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('ALL');

  // Selected ticket modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState<string>('');
  const [adminNoteVal, setAdminNoteVal] = useState<string>('');
  const [updatingTicket, setUpdatingTicket] = useState<boolean>(false);

  // FAQs state
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('ALL');
  const [faqLoading, setFaqLoading] = useState<boolean>(false);

  // Add FAQ Dialog
  const [addFaqOpen, setAddFaqOpen] = useState<boolean>(false);
  const [newFaqCategory, setNewFaqCategory] = useState<string>('General');
  const [newFaqQuestion, setNewFaqQuestion] = useState<string>('');
  const [newFaqAnswer, setNewFaqAnswer] = useState<string>('');

  // Legal / Policy documents state
  const [privacyPolicy, setPrivacyPolicy] = useState<any>(null);
  const [termsContent, setTermsContent] = useState<any>(null);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState<boolean>(false);

  // Fetch Support Tickets
  const fetchTickets = () => {
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
  };

  // Fetch FAQs
  const fetchFaqs = () => {
    setFaqLoading(true);
    apiClient
      .get('/public/faqs')
      .then((res) => {
        if (res.data && Array.isArray(res.data.faqs)) {
          setFaqs(res.data.faqs);
        } else if (Array.isArray(res.data)) {
          setFaqs(res.data);
        }
      })
      .catch((err) => {
        console.debug('Failed to fetch FAQs:', err.message);
      })
      .finally(() => {
        setFaqLoading(false);
      });
  };

  // Fetch Legal Documents
  const fetchLegalDocs = () => {
    setContentLoading(true);
    Promise.all([
      apiClient.get('/public/content/privacy').catch(() => ({ data: null })),
      apiClient.get('/public/content/terms').catch(() => ({ data: null })),
      apiClient.get('/public/content/about').catch(() => ({ data: null })),
    ])
      .then(([privRes, termsRes, aboutRes]) => {
        if (privRes?.data) setPrivacyPolicy(privRes.data);
        if (termsRes?.data) setTermsContent(termsRes.data);
        if (aboutRes?.data) setAboutContent(aboutRes.data);
      })
      .finally(() => {
        setContentLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
    fetchFaqs();
    fetchLegalDocs();
  }, []);

  // Handle Ticket Status Update
  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setUpdatingTicket(true);
    try {
      await apiClient.put(`/admin/support/tickets/${selectedTicket.id}/status`, {
        status: updateStatusVal,
        adminNote: adminNoteVal,
      });
      enqueueSnackbar(`Ticket ${selectedTicket.ticketNumber || selectedTicket.id} updated successfully!`, {
        variant: 'success',
      });
      fetchTickets();
      setSelectedTicket(null);
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to update ticket status', { variant: 'error' });
    } finally {
      setUpdatingTicket(false);
    }
  };

  // Handle Ticket Delete
  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this support ticket?')) return;
    try {
      await apiClient.delete(`/admin/support/tickets/${ticketId}`);
      enqueueSnackbar('Support ticket deleted successfully', { variant: 'info' });
      fetchTickets();
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to delete ticket', { variant: 'error' });
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    const q = ticketSearch.trim().toLowerCase();
    return tickets.filter((t) => {
      if (ticketStatusFilter !== 'ALL' && (t.status || 'OPEN').toUpperCase() !== ticketStatusFilter) return false;
      if (ticketCategoryFilter !== 'ALL' && (t.category || 'GENERAL').toUpperCase() !== ticketCategoryFilter) return false;
      if (!q) return true;
      return [t.ticketNumber, t.name, t.email, t.phone, t.title, t.description, t.category, t.bookingId]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [tickets, ticketSearch, ticketStatusFilter, ticketCategoryFilter]);

  // Ticket stats
  const totalTickets = tickets.length;
  const openCount = tickets.filter((t) => (t.status || 'OPEN').toUpperCase() === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => (t.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes((t.status || '').toUpperCase())).length;

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    const q = faqSearch.trim().toLowerCase();
    return faqs.filter((f) => {
      if (faqCategoryFilter !== 'ALL' && f.category.toLowerCase() !== faqCategoryFilter.toLowerCase()) return false;
      if (!q) return true;
      return (f.question || '').toLowerCase().includes(q) || (f.answer || '').toLowerCase().includes(q);
    });
  }, [faqs, faqSearch, faqCategoryFilter]);

  // Unique FAQ categories
  const faqCategories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => f.category && set.add(f.category));
    return Array.from(set);
  }, [faqs]);

  // DataGrid Columns for Support Tickets
  const ticketColumns: GridColDef<SupportTicketRecord>[] = [
    {
      field: 'ticketNumber',
      headerName: 'Ticket #',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value || `BLZ-${params.row.id?.substring(0, 6)}`}
          size="small"
          sx={{ fontWeight: 800, bgcolor: 'rgba(99,102,241,0.1)', color: '#6366F1' }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Traveler',
      width: 220,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {params.value || 'Traveler'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => {
        const cat = (params.value || 'GENERAL').toUpperCase();
        let color = '#64748B';
        if (cat.includes('FLIGHT')) color = '#2563EB';
        else if (cat.includes('EMERGENCY')) color = '#EF4444';
        else if (cat.includes('BILLING') || cat.includes('PAYMENT')) color = '#10B981';
        return (
          <Chip
            label={cat}
            size="small"
            sx={{ fontWeight: 700, bgcolor: `${color}15`, color, border: `1px solid ${color}40` }}
          />
        );
      },
    },
    {
      field: 'title',
      headerName: 'Subject & Inquiry',
      flex: 1,
      minWidth: 280,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {params.value || 'Support Inquiry'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 400 }}>
            {params.row.description || 'No description'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const s = (params.value || 'OPEN').toUpperCase();
        if (s === 'OPEN') {
          return <Chip icon={<HourglassTopIcon />} label="OPEN" size="small" color="warning" sx={{ fontWeight: 700 }} />;
        }
        if (s === 'IN_PROGRESS') {
          return <Chip icon={<HourglassTopIcon />} label="IN PROGRESS" size="small" color="info" sx={{ fontWeight: 700 }} />;
        }
        if (s === 'RESOLVED') {
          return <Chip icon={<CheckCircleIcon />} label="RESOLVED" size="small" color="success" sx={{ fontWeight: 700 }} />;
        }
        return <Chip label={s} size="small" sx={{ fontWeight: 700 }} />;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleString() : '—'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View & Update Ticket">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedTicket(params.row);
                setUpdateStatusVal(params.row.status || 'OPEN');
                setAdminNoteVal(params.row.adminNote || '');
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Ticket">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteTicket(params.row.id)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="CMS & Customer Support Center"
        subtitle="Manage traveler support tickets, FAQ knowledgebase, and official legal platform policies."
        breadcrumbs={[{ label: 'Content' }, { label: 'CMS & Support' }]}
      />

      {/* Tabs */}
      <GlassCard sx={{ p: 1, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<SupportAgentIcon />}
            iconPosition="start"
            label={`Customer Support Tickets (${openCount} Open)`}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            icon={<HelpOutlineIcon />}
            iconPosition="start"
            label={`Platform FAQs (${faqs.length})`}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            icon={<DescriptionIcon />}
            iconPosition="start"
            label="Legal & Platform Documents"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
        </Tabs>
      </GlassCard>

      {/* TAB 0: SUPPORT TICKETS */}
      {activeTab === 0 && (
        <Box sx={{ animation: `${fadeUp} .4s ease-out` }}>
          {/* KPI Stat Cards */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <GlassCard sx={{ p: 2, flex: 1, borderLeft: '4px solid #6366F1' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                TOTAL TICKETS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#6366F1' }}>
                {totalTickets}
              </Typography>
            </GlassCard>
            <GlassCard sx={{ p: 2, flex: 1, borderLeft: '4px solid #F59E0B' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                OPEN INQUIRIES
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#F59E0B' }}>
                {openCount}
              </Typography>
            </GlassCard>
            <GlassCard sx={{ p: 2, flex: 1, borderLeft: '4px solid #0EA5E9' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                IN PROGRESS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#0EA5E9' }}>
                {inProgressCount}
              </Typography>
            </GlassCard>
            <GlassCard sx={{ p: 2, flex: 1, borderLeft: '4px solid #10B981' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                RESOLVED / CLOSED
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#10B981' }}>
                {resolvedCount}
              </Typography>
            </GlassCard>
          </Stack>

          {/* Tickets DataGrid Container */}
          <GlassCard sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search ticket #, traveler, subject, booking..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 320 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
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
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={ticketCategoryFilter}
                    label="Category"
                    onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    <MenuItem value="FLIGHTS">Flights</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency</MenuItem>
                    <MenuItem value="BILLING">Billing</MenuItem>
                    <MenuItem value="GENERAL">General</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTickets}
                disabled={ticketLoading}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Refresh
              </Button>
            </Stack>

            {!ticketLoading && filteredTickets.length === 0 ? (
              <EmptyState
                title={tickets.length === 0 ? 'No Support Tickets Found' : 'No tickets match your filters'}
                description={
                  tickets.length === 0
                    ? 'When travelers submit inquiries via the mobile application or web portal, their tickets will appear here.'
                    : 'Try clearing your search query or status filter.'
                }
              />
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <DataGrid
                  rows={filteredTickets}
                  columns={ticketColumns}
                  loading={ticketLoading}
                  autoHeight
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                    sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
                  }}
                  sx={{
                    border: 0,
                    minWidth: 1000,
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800 },
                    '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
                  }}
                />
              </Box>
            )}
          </GlassCard>
        </Box>
      )}

      {/* TAB 1: FAQS MANAGER */}
      {activeTab === 1 && (
        <Box sx={{ animation: `${fadeUp} .4s ease-out` }}>
          <GlassCard sx={{ p: 2.5, mb: 3 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search questions or answers..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 320 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={faqCategoryFilter}
                    label="Category"
                    onChange={(e) => setFaqCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    {faqCategories.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setAddFaqOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Add FAQ
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchFaqs}
                  disabled={faqLoading}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {filteredFaqs.length} FAQs across {faqCategories.length} categories delivered live to mobile app users.
            </Typography>

            {filteredFaqs.map((faq, idx) => (
              <Accordion
                key={faq.id || idx}
                sx={{
                  mb: 1.5,
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip
                      label={faq.category}
                      size="small"
                      sx={{ fontWeight: 700, bgcolor: 'rgba(99,102,241,0.1)', color: '#6366F1' }}
                    />
                    <Typography sx={{ fontWeight: 700 }}>{faq.question}</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </GlassCard>
        </Box>
      )}

      {/* TAB 2: LEGAL & PLATFORM DOCUMENTS */}
      {activeTab === 2 && (
        <Box sx={{ animation: `${fadeUp} .4s ease-out` }}>
          <Stack spacing={3}>
            {/* Privacy Policy */}
            <GlassCard sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {privacyPolicy?.title || 'Bleez Privacy Policy'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {privacyPolicy?.last_updated || '2026-11-01'} | Endpoint: <code>/api/public/content/privacy</code>
                  </Typography>
                </Box>
                <Chip label="Live on iOS & Android" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Stack>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                {privacyPolicy?.summary || 'Bleez encrypts traveler telemetry and respects user data privacy.'}
              </Typography>
              {privacyPolicy?.data_collected && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Data Collected:
                  </Typography>
                  {privacyPolicy.data_collected.map((item: string, i: number) => (
                    <Typography key={i} variant="caption" sx={{ display: 'block', color: 'text.secondary', ml: 2 }}>
                      • {item}
                    </Typography>
                  ))}
                </Box>
              )}
            </GlassCard>

            {/* Terms of Service */}
            <GlassCard sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {termsContent?.title || 'Bleez Terms & Conditions'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {termsContent?.last_updated || '2026-11-01'} | Endpoint: <code>/api/public/content/terms</code>
                  </Typography>
                </Box>
                <Chip label="Live on iOS & Android" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Stack>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                {termsContent?.summary || 'Terms governing use of AI itineraries, flight booking tariffs, and SOS advisory tools.'}
              </Typography>
            </GlassCard>

            {/* About Bleez */}
            <GlassCard sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {aboutContent?.app_name || 'About Bleez Travel AI'} (v{aboutContent?.version || '2.1.0'})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Company: {aboutContent?.company || 'AI Travel Globe Inc.'} | Support: {aboutContent?.support_email || 'support@aitravelglobe.com'}
                  </Typography>
                </Box>
                <Chip label="Version 2.1.0" color="primary" size="small" sx={{ fontWeight: 700 }} />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {aboutContent?.description || 'Autonomous travel companion safeguarding journeys with AI guardians worldwide.'}
              </Typography>
            </GlassCard>
          </Stack>
        </Box>
      )}

      {/* Ticket Details & Status Update Dialog */}
      <Dialog
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Support Ticket: {selectedTicket?.ticketNumber || selectedTicket?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    TRAVELER
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selectedTicket.name || 'Anonymous Traveler'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📧 {selectedTicket.email || 'No email'} | 📞 {selectedTicket.phone || 'No phone'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    CATEGORY & BOOKING
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Category: <Chip label={selectedTicket.category || 'GENERAL'} size="small" />
                  </Typography>
                  {selectedTicket.bookingId && (
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 700, mt: 0.5 }}>
                      Booking Ref: {selectedTicket.bookingId}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Subject: {selectedTicket.title}
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedTicket.description}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Submitted: {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : '—'}
                  {selectedTicket.resolvedAt && ` | Resolved: ${new Date(selectedTicket.resolvedAt).toLocaleString()}`}
                </Typography>
              </Box>

              <Divider />

              {/* Status Update Form */}
              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Update Ticket Status & Admin Resolution
                </Typography>
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
              </Box>
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

      {/* Add FAQ Dialog */}
      <Dialog open={addFaqOpen} onClose={() => setAddFaqOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Knowledgebase FAQ</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              size="small"
              label="Category"
              value={newFaqCategory}
              onChange={(e) => setNewFaqCategory(e.target.value)}
              placeholder="e.g. AI Trip Planner, Emergency, Flights"
              fullWidth
            />
            <TextField
              size="small"
              label="Question"
              value={newFaqQuestion}
              onChange={(e) => setNewFaqQuestion(e.target.value)}
              placeholder="Enter traveler question..."
              fullWidth
            />
            <TextField
              size="small"
              multiline
              rows={4}
              label="Answer"
              value={newFaqAnswer}
              onChange={(e) => setNewFaqAnswer(e.target.value)}
              placeholder="Enter comprehensive answer..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddFaqOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
                enqueueSnackbar('Please enter both question and answer', { variant: 'warning' });
                return;
              }
              setFaqs((prev) => [
                {
                  id: `faq-${Date.now()}`,
                  category: newFaqCategory.trim() || 'General',
                  question: newFaqQuestion.trim(),
                  answer: newFaqAnswer.trim(),
                },
                ...prev,
              ]);
              enqueueSnackbar('FAQ added to local knowledgebase!', { variant: 'success' });
              setAddFaqOpen(false);
              setNewFaqQuestion('');
              setNewFaqAnswer('');
            }}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Add FAQ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
