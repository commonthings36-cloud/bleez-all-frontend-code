import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar,
  Autocomplete,
  InputAdornment,
  CircularProgress,
  Divider,
  Stack,
  Alert,
  ListSubheader,
  ToggleButton,
  ToggleButtonGroup,
  keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Campaign as CampaignIcon,
  AutoAwesome,
  CheckCircle,
  PauseCircle,
  PlayArrow,
  Add,
  TrendingUp,
  BarChart,
  FlashOn,
  People,
  BusinessCenter,
  Person,
  Refresh,
  Delete,
  UploadFile,
  Tune,
  GroupAdd,
  FilterAlt,
  Layers,
  Search,
  Public,
  Close,
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { TravelHeroArt } from '@/components/Illustrations';
import { campaignService } from '../services/campaign.service';
import {
  Campaign,
  CampaignOpportunity,
  CampaignAnalytics,
  UserSearchResult,
  AudienceEstimate,
  AudienceCondition,
} from '../types/campaign.types';

// Attribute configuration for context-aware conditions and operators
// Attribute configuration for context-aware conditions and operators
interface AttributeConfig {
  label: string;
  category: 'Demographics & Profile' | 'Travel & Lifestyle' | 'Activity & Telemetry';
  type: 'string' | 'number' | 'enum';
  defaultOperator: AudienceCondition['operator'];
  validOperators: Array<{ value: AudienceCondition['operator']; label: string }>;
  placeholder: string;
  options?: Array<{ value: string; label: string }>;
}

const TARGET_ATTRIBUTE_CONFIG: Record<string, AttributeConfig> = {
  // --- Demographics & Profile ---
  profession: {
    label: '💼 Profession / Industry',
    category: 'Demographics & Profile',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select profession category',
    options: [
      { value: 'Technology & IT', label: '💻 Technology & IT' },
      { value: 'Healthcare & Medicine', label: '🩺 Healthcare & Medicine' },
      { value: 'Finance & Banking', label: '🏦 Finance & Banking' },
      { value: 'Education & Academia', label: '🎓 Education & Academia' },
      { value: 'Legal & Law', label: '⚖️ Legal & Law' },
      { value: 'Executive & Management', label: '👔 Executive & Management' },
      { value: 'Creative, Arts & Media', label: '🎨 Creative, Arts & Media' },
      { value: 'Sales & Marketing', label: '📈 Sales & Marketing' },
      { value: 'Government & Public Sector', label: '🏛️ Government & Public Sector' },
      { value: 'Student', label: '🎒 Student' },
      { value: 'Freelancer / Self-Employed', label: '🚀 Freelancer / Self-Employed' },
    ],
  },
  religion: {
    label: '🕊️ Religion / Spiritual Affiliation',
    category: 'Demographics & Profile',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select religion preference',
    options: [
      { value: 'Christianity', label: '✝️ Christianity' },
      { value: 'Islam', label: '☪️ Islam' },
      { value: 'Hinduism', label: '🕉️ Hinduism' },
      { value: 'Buddhism', label: '☸️ Buddhism' },
      { value: 'Judaism', label: '✡️ Judaism' },
      { value: 'Sikhism', label: '☬ Sikhism' },
      { value: 'Jainism', label: '🌿 Jainism' },
      { value: 'Spiritual / Other', label: '✨ Spiritual / Other' },
    ],
  },
  age: {
    label: '🎂 Age (Years)',
    category: 'Demographics & Profile',
    type: 'number',
    defaultOperator: 'GREATER_THAN',
    validOperators: [
      { value: 'GREATER_THAN', label: 'GREATER THAN (>=)' },
      { value: 'LESS_THAN', label: 'LESS THAN (<=)' },
      { value: 'EQUALS', label: 'EQUALS (=)' },
    ],
    placeholder: 'e.g. 25',
  },
  gender: {
    label: '⚧️ Gender Identity',
    category: 'Demographics & Profile',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select gender',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Non-Binary', label: 'Non-Binary' },
      { value: 'Prefer Not to Say', label: 'Prefer Not to Say' },
    ],
  },
  maritalStatus: {
    label: '💍 Marital / Relationship Status',
    category: 'Demographics & Profile',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select status',
    options: [
      { value: 'Single', label: 'Single' },
      { value: 'Married', label: 'Married' },
      { value: 'In a Relationship', label: 'In a Relationship' },
    ],
  },
  preferredLanguage: {
    label: '🗣️ Preferred Language',
    category: 'Demographics & Profile',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select language',
    options: [
      { value: 'English', label: 'English' },
      { value: 'Spanish', label: 'Spanish' },
      { value: 'French', label: 'French' },
      { value: 'German', label: 'German' },
      { value: 'Hindi', label: 'Hindi' },
      { value: 'Arabic', label: 'Arabic' },
      { value: 'Japanese', label: 'Japanese' },
      { value: 'Mandarin', label: 'Mandarin' },
    ],
  },

  // --- Travel & Lifestyle ---
  travelType: {
    label: '🧳 Travel Party Type',
    category: 'Travel & Lifestyle',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select travel party type',
    options: [
      { value: 'Solo', label: '🎒 Solo Traveler' },
      { value: 'Family', label: '👨‍👩‍👧‍👦 Family with Kids' },
      { value: 'Couple', label: '💑 Couple / Romantic' },
      { value: 'Friends', label: '👥 Group of Friends' },
      { value: 'Business', label: '💼 Business Traveler' },
    ],
  },
  foodPreference: {
    label: '🍽️ Dietary / Food Preference',
    category: 'Travel & Lifestyle',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select dietary preference',
    options: [
      { value: 'Halal', label: '🌙 Halal' },
      { value: 'Kosher', label: '✡️ Kosher' },
      { value: 'Vegetarian', label: '🥗 Vegetarian' },
      { value: 'Vegan', label: '🌱 Vegan' },
      { value: 'Gluten-Free', label: '🌾 Gluten-Free' },
      { value: 'Jain', label: '🌿 Jain' },
      { value: 'No Restrictions', label: '🍴 No Restrictions / All' },
    ],
  },
  budget: {
    label: '💰 Budget Level',
    category: 'Travel & Lifestyle',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select budget tier',
    options: [
      { value: 'Budget', label: '🏷️ Budget / Economy' },
      { value: 'Moderate', label: '⚖️ Moderate / Standard' },
      { value: 'Luxury', label: '💎 Luxury / Premium' },
      { value: 'Ultra-Luxury', label: '👑 Ultra-Luxury / VIP' },
    ],
  },
  tripPace: {
    label: '🏃‍♂️ Trip Pace',
    category: 'Travel & Lifestyle',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select trip pace',
    options: [
      { value: 'Relaxed', label: '🧘 Relaxed & Leisurely' },
      { value: 'Moderate', label: '🚶 Balanced & Moderate' },
      { value: 'Fast-Paced', label: '⚡ Fast-Paced & Intensive' },
    ],
  },
  isBusinessTraveler: {
    label: '🏢 Corporate / Business Traveler',
    category: 'Travel & Lifestyle',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
    ],
    placeholder: 'Select',
    options: [
      { value: 'true', label: 'Yes (Business / Corporate)' },
      { value: 'false', label: 'No (Leisure Traveler)' },
    ],
  },

  // --- Activity & Telemetry ---
  destinationInterest: {
    label: '📍 Destination Interest',
    category: 'Activity & Telemetry',
    type: 'string',
    defaultOperator: 'CONTAINS',
    validOperators: [
      { value: 'CONTAINS', label: 'CONTAINS' },
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'e.g. Tokyo, Paris, Dubai',
  },
  detectedCountry: {
    label: '🌍 Location / Country',
    category: 'Activity & Telemetry',
    type: 'string',
    defaultOperator: 'CONTAINS',
    validOperators: [
      { value: 'CONTAINS', label: 'CONTAINS' },
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'e.g. United States, Japan, India, UK',
  },
  intentScore: {
    label: '🔥 Intent Score (0-100)',
    category: 'Activity & Telemetry',
    type: 'number',
    defaultOperator: 'GREATER_THAN',
    validOperators: [
      { value: 'GREATER_THAN', label: 'GREATER THAN (>=)' },
      { value: 'LESS_THAN', label: 'LESS THAN (<=)' },
      { value: 'EQUALS', label: 'EQUALS (=)' },
    ],
    placeholder: 'e.g. 60',
  },
  lastActiveDays: {
    label: '⏱️ Active Within Last (Days)',
    category: 'Activity & Telemetry',
    type: 'number',
    defaultOperator: 'WITHIN_LAST_DAYS',
    validOperators: [
      { value: 'WITHIN_LAST_DAYS', label: 'WITHIN LAST (Days <=)' },
      { value: 'GREATER_THAN', label: 'MORE THAN (Days >)' },
    ],
    placeholder: 'e.g. 7',
  },
  totalBookings: {
    label: '✈️ Lifetime Bookings',
    category: 'Activity & Telemetry',
    type: 'number',
    defaultOperator: 'GREATER_THAN',
    validOperators: [
      { value: 'GREATER_THAN', label: 'GREATER THAN (>=)' },
      { value: 'LESS_THAN', label: 'LESS THAN (<=)' },
      { value: 'EQUALS', label: 'EQUALS (=)' },
    ],
    placeholder: 'e.g. 3',
  },
  totalExpenses: {
    label: '💳 Total Spent (USD)',
    category: 'Activity & Telemetry',
    type: 'number',
    defaultOperator: 'GREATER_THAN',
    validOperators: [
      { value: 'GREATER_THAN', label: 'GREATER THAN (>=)' },
      { value: 'LESS_THAN', label: 'LESS THAN (<=)' },
      { value: 'EQUALS', label: 'EQUALS (=)' },
    ],
    placeholder: 'e.g. 500',
  },
  primaryPlatform: {
    label: '📱 Platform / Device',
    category: 'Activity & Telemetry',
    type: 'enum',
    defaultOperator: 'EQUALS',
    validOperators: [
      { value: 'EQUALS', label: 'EQUALS (=)' },
      { value: 'NOT_EQUALS', label: 'NOT EQUALS (≠)' },
    ],
    placeholder: 'Select platform',
    options: [
      { value: 'MOBILE_APP_IOS', label: 'iOS Mobile App' },
      { value: 'MOBILE_APP_ANDROID', label: 'Android Mobile App' },
      { value: 'WEB_APP_CHROME', label: 'Web Chrome' },
      { value: 'WEB_APP_SAFARI', label: 'Web Safari' },
    ],
  },
};

export const CampaignsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [opportunities, setOpportunities] = useState<CampaignOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState<CampaignAnalytics | null>(null);

  // New Campaign Form State (15-step creation wizard dialog)
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    paradigm: 'DYNAMIC',
    audienceScope: 'MASS_SEGMENT_AUDIENCE',
    objective: 'DESTINATION_PROMOTION',
    priority: 8,
    targetUserIds: [],
    audienceRule: {
      operator: 'AND',
      conditions: [
        { field: 'destinationInterest', operator: 'CONTAINS', value: 'Tokyo' },
        { field: 'intentScore', operator: 'GREATER_THAN', value: 60 },
      ],
    },
    content: {
      web: {
        placement: 'HOME_HERO',
        title: '',
        subtitle: '',
        ctaText: 'Explore Now',
        ctaLink: '/itinerary/create',
      },
    },
  });

  // User search & audience targeting states
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [audienceEstimate, setAudienceEstimate] = useState<AudienceEstimate | null>({
    totalUsers: 12822,
    estimatedAudienceSize: 12822,
    percentageOfTotal: 100,
    audienceScope: 'MASS_SEGMENT_AUDIENCE',
  });
  const [estimatingAudience, setEstimatingAudience] = useState(false);
  const [csvUploadInfo, setCsvUploadInfo] = useState<string | null>(null);

  // User search helper
  const handleUserSearch = async (query: string) => {
    setUserSearchLoading(true);
    try {
      const results = await campaignService.searchUsers(query);
      setUserSearchResults(results);
    } catch {
      setUserSearchResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  // Audience estimation calculation
  const updateAudienceEstimate = useCallback(async (draft: Partial<Campaign>) => {
    setEstimatingAudience(true);
    try {
      const estimate = await campaignService.estimateAudience(draft);
      setAudienceEstimate(estimate);
    } catch {
      // Fallback local estimation calculation
      let count = 12822;
      const scope = draft.audienceScope;
      if (scope === 'INDIVIDUAL_APP_USER') {
        count = draft.targetUserId ? 1 : 0;
      } else if (scope === 'MULTI_USER_BATCH') {
        count = draft.targetUserIds?.length || 0;
      } else if (scope === 'DYNAMIC_SEGMENT') {
        const condCount = draft.audienceRule?.conditions?.length || 0;
        count = Math.max(50, Math.round(12822 * Math.pow(0.55, condCount || 1)));
      } else if (scope === 'B2B_ENTERPRISE_ACCOUNT') {
        count = 128;
      }
      setAudienceEstimate({
        totalUsers: 12822,
        estimatedAudienceSize: count,
        percentageOfTotal: Math.round((count / 12822) * 1000) / 10,
        audienceScope: scope || 'MASS_SEGMENT_AUDIENCE',
      });
    } finally {
      setEstimatingAudience(false);
    }
  }, []);

  useEffect(() => {
    if (openCreateDialog) {
      handleUserSearch('');
      updateAudienceEstimate(newCampaign);
    }
  }, [openCreateDialog]);

  // Handle Condition mutations
  const handleAddCondition = () => {
    const currentConditions = newCampaign.audienceRule?.conditions || [];
    const updatedConditions: AudienceCondition[] = [
      ...currentConditions,
      { field: 'destinationInterest', operator: 'CONTAINS', value: '' },
    ];
    const updated = {
      ...newCampaign,
      audienceRule: {
        operator: newCampaign.audienceRule?.operator || 'AND',
        conditions: updatedConditions,
      },
    };
    setNewCampaign(updated);
    updateAudienceEstimate(updated);
  };

  const handleRemoveCondition = (index: number) => {
    const currentConditions = newCampaign.audienceRule?.conditions || [];
    const updatedConditions = currentConditions.filter((_, i) => i !== index);
    const updated = {
      ...newCampaign,
      audienceRule: {
        operator: newCampaign.audienceRule?.operator || 'AND',
        conditions: updatedConditions,
      },
    };
    setNewCampaign(updated);
    updateAudienceEstimate(updated);
  };

  const handleConditionChange = (index: number, key: keyof AudienceCondition, val: any) => {
    const currentConditions = [...(newCampaign.audienceRule?.conditions || [])];
    if (currentConditions[index]) {
      if (key === 'field') {
        const newField = val;
        const attrConfig = TARGET_ATTRIBUTE_CONFIG[newField] || TARGET_ATTRIBUTE_CONFIG.destinationInterest;
        currentConditions[index] = {
          field: newField,
          operator: attrConfig.defaultOperator,
          value: attrConfig.type === 'enum' && attrConfig.options ? attrConfig.options[0].value : '',
        };
      } else {
        currentConditions[index] = { ...currentConditions[index], [key]: val };
      }
      const updated = {
        ...newCampaign,
        audienceRule: {
          operator: newCampaign.audienceRule?.operator || 'AND',
          conditions: currentConditions,
        },
      };
      setNewCampaign(updated);
      updateAudienceEstimate(updated);
    }
  };

  // CSV/TXT Batch user import
  const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const ids = text
          .split(/[\r\n,]+/)
          .map((id) => id.trim())
          .filter((id) => id.length > 0);

        const uniqueIds = Array.from(new Set(ids));
        const updated = {
          ...newCampaign,
          targetUserIds: uniqueIds,
        };
        setNewCampaign(updated);
        setCsvUploadInfo(`Successfully imported ${uniqueIds.length} user IDs from ${file.name}`);
        enqueueSnackbar(`Imported ${uniqueIds.length} target users from ${file.name}`, { variant: 'success' });
        updateAudienceEstimate(updated);
      }
    };
    reader.readAsText(file);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignList, oppList] = await Promise.all([
        campaignService.getAllCampaigns(),
        campaignService.getRecommendedOpportunities(),
      ]);
      setCampaigns(campaignList);
      setOpportunities(oppList);

      if (campaignList.length > 0) {
        const analytics = await campaignService.getCampaignAnalytics(campaignList[0].id);
        setSelectedAnalytics(analytics);
      }
    } catch (err: any) {
      enqueueSnackbar('Loaded default campaign data.', { variant: 'info' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCampaign = async () => {
    try {
      await campaignService.createCampaign(newCampaign);
      enqueueSnackbar('Campaign draft created successfully!', { variant: 'success' });
      setOpenCreateDialog(false);
      fetchData();
    } catch (err: any) {
      enqueueSnackbar('Failed to create campaign draft.', { variant: 'error' });
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      await campaignService.submitForApproval(id);
      enqueueSnackbar('Campaign submitted for approval!', { variant: 'success' });
      fetchData();
    } catch (err: any) {
      enqueueSnackbar('Submission error.', { variant: 'error' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await campaignService.approveCampaign(id);
      enqueueSnackbar('Campaign approved!', { variant: 'success' });
      fetchData();
    } catch (err: any) {
      enqueueSnackbar('Approval error.', { variant: 'error' });
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await campaignService.activateCampaign(id);
      enqueueSnackbar('Campaign activated!', { variant: 'success' });
      fetchData();
    } catch (err: any) {
      enqueueSnackbar('Activation error.', { variant: 'error' });
    }
  };

  const handlePause = async (id: string) => {
    try {
      await campaignService.pauseCampaign(id);
      enqueueSnackbar('Campaign paused.', { variant: 'info' });
      fetchData();
    } catch (err: any) {
      enqueueSnackbar('Pause error.', { variant: 'error' });
    }
  };

  const handleConvertOpportunity = async (oppId: string) => {
    try {
      const draft = await campaignService.convertOpportunityToDraft(oppId);
      enqueueSnackbar(`Converted AI Opportunity to Draft Campaign: ${draft.name}`, { variant: 'success' });
      fetchData();
    } catch (err: any) {
      enqueueSnackbar('Failed to convert opportunity.', { variant: 'error' });
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return <Chip label={status} color="success" size="small" icon={<CheckCircle />} />;
      case 'PENDING_APPROVAL':
      case 'SUBMITTED':
        return <Chip label="PENDING APPROVAL" color="warning" size="small" />;
      case 'PAUSED':
        return <Chip label={status} color="default" size="small" icon={<PauseCircle />} />;
      case 'DRAFT':
        return <Chip label={status} color="primary" size="small" variant="outlined" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'INDIVIDUAL_APP_USER':
        return <Person fontSize="small" color="primary" />;
      case 'B2B_ENTERPRISE_ACCOUNT':
        return <BusinessCenter fontSize="small" color="secondary" />;
      default:
        return <People fontSize="small" color="action" />;
    }
  };

  // ───────── redesigned view helpers ─────────
  const campFade = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
  const [campQuery, setCampQuery] = useState('');
  const [campStatus, setCampStatus] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'DRAFT' | 'PAUSED'>('ALL');
  const statusBucket = (s: string) => (s === 'APPROVED' || s === 'ACTIVE' ? 'ACTIVE' : s === 'PENDING_APPROVAL' || s === 'SUBMITTED' ? 'PENDING' : s);
  const visibleCampaigns = campaigns.filter((c) => {
    if (campStatus !== 'ALL' && statusBucket(c.status) !== campStatus) return false;
    const q = campQuery.trim().toLowerCase();
    return !q || [c.name, c.id, c.audienceScope, c.paradigm].some((v) => (v || '').toLowerCase().includes(q));
  });
  const activeCount = campaigns.filter((c) => c.status === 'APPROVED' || c.status === 'ACTIVE').length;
  const recommendedCount = opportunities.filter((o) => o.status === 'RECOMMENDED').length;
  const delivered = selectedAnalytics?.deliveredCount;
  const rate = (a?: number, b?: number) => (a != null && b ? Math.min(100, (a / b) * 100) : 0);

  const campKpis = [
    { label: 'Active campaigns', value: activeCount.toLocaleString(), sub: `${campaigns.length} total registered`, color: '#7C3AED', icon: <CampaignIcon /> },
    { label: 'AI opportunities', value: recommendedCount.toLocaleString(), sub: 'Drafts pending review', color: '#EC4899', icon: <AutoAwesome /> },
    { label: 'Messages delivered', value: delivered != null ? delivered.toLocaleString() : '—', sub: selectedAnalytics ? `${rate(selectedAnalytics.deliveredCount, selectedAnalytics.targetCount).toFixed(1)}% of target · ${selectedAnalytics.campaignName}` : 'No analytics yet', color: '#3B82F6', icon: <TrendingUp /> },
    { label: 'Attributed revenue', value: selectedAnalytics ? `$${Number(selectedAnalytics.attributedRevenue || 0).toLocaleString()}` : '—', sub: selectedAnalytics ? `${selectedAnalytics.conversionCount} conversions` : 'No analytics yet', color: '#F59E0B', icon: <BarChart /> },
  ];

  const scopeLabel = (s: string) => (s || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

  const campaignColumns: GridColDef<Campaign>[] = [
    {
      field: 'name', headerName: 'Campaign', flex: 1, minWidth: 260,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}><CampaignIcon fontSize="small" /></Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.4 }}>{p.row.name}</Typography>
            <Typography noWrap sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1.3 }}>ID: {p.row.id}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'audienceScope', headerName: 'Scope', width: 220,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.75} alignItems="center">{getScopeIcon(p.row.audienceScope)}<Typography noWrap sx={{ fontSize: '0.85rem' }}>{scopeLabel(p.row.audienceScope)}</Typography></Stack>
      ),
    },
    { field: 'paradigm', headerName: 'Paradigm', width: 130, renderCell: (p) => <Chip label={p.row.paradigm} size="small" variant="outlined" color={p.row.paradigm === 'DYNAMIC' ? 'secondary' : 'default'} sx={{ fontWeight: 700 }} /> },
    { field: 'status', headerName: 'Status', width: 190, renderCell: (p) => getStatusChip(p.row.status) },
    {
      field: 'priority', headerName: 'Priority', width: 140, type: 'number',
      renderCell: (p) => (
        <Box sx={{ width: '100%' }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{p.row.priority}/10</Typography>
          <LinearProgress variant="determinate" value={(Number(p.row.priority) || 0) * 10} sx={{ height: 5, borderRadius: 4, mt: 0.4 }} />
        </Box>
      ),
    },
    { field: 'creatorUserRole', headerName: 'Created by', width: 150, valueGetter: (_v, r) => (r.creatorUserRole || 'SUPER_ADMIN').replace(/_/g, ' ') },
    {
      field: 'actions', headerName: 'Actions', width: 200, sortable: false, align: 'right', headerAlign: 'right',
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {p.row.status === 'DRAFT' && <Button size="small" variant="outlined" onClick={() => handleSubmitForApproval(p.row.id)}>Submit approval</Button>}
          {p.row.status === 'PENDING_APPROVAL' && <Button size="small" variant="contained" color="success" onClick={() => handleApprove(p.row.id)}>Approve</Button>}
          {(p.row.status === 'APPROVED' || p.row.status === 'PAUSED') && <Tooltip title="Activate"><IconButton size="small" color="primary" onClick={() => handleActivate(p.row.id)}><PlayArrow /></IconButton></Tooltip>}
          {p.row.status === 'ACTIVE' && <Tooltip title="Pause"><IconButton size="small" color="warning" onClick={() => handlePause(p.row.id)}><PauseCircle /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ];

  const funnel = selectedAnalytics ? [
    { label: 'Delivered of target', value: rate(selectedAnalytics.deliveredCount, selectedAnalytics.targetCount), color: '#3B82F6', raw: `${selectedAnalytics.deliveredCount.toLocaleString()} / ${selectedAnalytics.targetCount.toLocaleString()}` },
    { label: 'Impressions of delivered', value: rate(selectedAnalytics.impressionCount, selectedAnalytics.deliveredCount), color: '#7C3AED', raw: selectedAnalytics.impressionCount.toLocaleString() },
    { label: 'Click-through rate', value: Number(selectedAnalytics.ctrPercent) || 0, color: '#F59E0B', raw: `${selectedAnalytics.ctrPercent}%` },
    { label: 'Conversion rate', value: Number(selectedAnalytics.conversionRatePercent) || 0, color: '#10B981', raw: `${selectedAnalytics.conversionRatePercent}%` },
  ] : [];

  return (
    <Box>
      <PageHeader
        title="Campaign Command Center"
        subtitle="First-party intelligent campaigns & customer engagement platform (ICCEE)"
        breadcrumbs={[{ label: 'Campaigns' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData} disabled={loading}>Refresh</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)} sx={{ fontWeight: 800 }}>Create Campaign</Button>
          </Stack>
        }
      />

      {/* 4 equal KPI cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3.5 }}>
        {campKpis.map((k, i) => (
          <GlassCard key={k.label} sx={{ p: 2.5, height: 128, display: 'flex', alignItems: 'center', animation: `${campFade} .5s ${i * 0.08}s ease-out both`, '&:hover': { transform: 'translateY(-4px)', borderColor: k.color, boxShadow: `0 14px 30px -12px ${k.color}77` } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ width: '100%' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>{k.label}</Typography>
                <Typography variant="h4" noWrap sx={{ fontWeight: 800, color: k.color, lineHeight: 1.25, letterSpacing: '-0.02em' }}>{k.value}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{k.sub}</Typography>
              </Box>
              <Box sx={{ width: 50, height: 50, borderRadius: '15px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, boxShadow: `0 10px 20px -8px ${k.color}` }}>{k.icon}</Box>
            </Stack>
          </GlassCard>
        ))}
      </Box>

      <GlassCard sx={{ mb: 3, animation: `${campFade} .6s .3s ease-out both` }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minHeight: 56 } }}
        >
          <Tab label={`Campaigns (${campaigns.length})`} icon={<CampaignIcon fontSize="small" />} iconPosition="start" />
          <Tab label={`AI Opportunities (${opportunities.length})`} icon={<AutoAwesome fontSize="small" />} iconPosition="start" />
          <Tab label="360° Analytics" icon={<TrendingUp fontSize="small" />} iconPosition="start" />
        </Tabs>
        {loading && <LinearProgress />}

        {/* Tab 0: Campaigns */}
        {activeTab === 0 && (
          <Box sx={{ p: 2.5 }}>
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <TextField
                size="small" placeholder="Search campaign name, ID, scope…" value={campQuery} onChange={(e) => setCampQuery(e.target.value)}
                sx={{ width: { xs: '100%', sm: 320 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              />
              <ToggleButtonGroup size="small" exclusive value={campStatus} onChange={(_, v) => v && setCampStatus(v)} color="primary" sx={{ flexWrap: 'wrap' }}>
                {(['ALL', 'ACTIVE', 'PENDING', 'DRAFT', 'PAUSED'] as const).map((s) => (
                  <ToggleButton key={s} value={s} sx={{ px: 2, fontWeight: 700 }}>{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Showing {visibleCampaigns.length} of {campaigns.length}</Typography>
            </Stack>
            {!loading && visibleCampaigns.length === 0 ? (
              <EmptyState
                title={campaigns.length ? 'No campaigns match your filters' : 'No campaigns yet'}
                description={campaigns.length ? 'Try clearing the search or status filter.' : 'Create your first campaign to start engaging travelers.'}
                actionLabel={campaigns.length ? undefined : 'Create Campaign'}
                onAction={campaigns.length ? undefined : () => setOpenCreateDialog(true)}
              />
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <DataGrid
                  rows={visibleCampaigns}
                  columns={campaignColumns}
                  getRowId={(r) => r.id}
                  rowHeight={64}
                  autoHeight
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  sx={{ border: 0, minWidth: 1250, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800 }, '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center', lineHeight: 1.4 } }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: AI Opportunities */}
        {activeTab === 1 && (
          <Box sx={{ p: 2.5 }}>
            {opportunities.length === 0 ? (
              <EmptyState title="No AI opportunities right now" description="When the engine spots a promising audience or destination, its recommended campaign draft will appear here." />
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2.5 }}>
                {opportunities.map((opp, i) => {
                  const conf = Math.round((opp.confidenceScore || 0) * 100);
                  return (
                    <Box key={opp.id} sx={{ display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '18px', border: '1px solid', borderColor: 'divider', borderTop: '4px solid #EC4899', animation: `${campFade} .5s ${i * 0.07}s ease-out both`, transition: 'all .25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 36px -18px rgba(236,72,153,.55)' } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.35 }}>{opp.title}</Typography>
                        <Chip label={`${conf}% confidence`} size="small" color="secondary" sx={{ fontWeight: 700, flexShrink: 0 }} />
                      </Stack>
                      <LinearProgress variant="determinate" value={conf} color="secondary" sx={{ height: 5, borderRadius: 4, my: 1.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 63 }}>{opp.rationale}</Typography>
                      <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: '14px', mb: 2, flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.06em' }}>RECOMMENDED CREATIVE DRAFT</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>{opp.recommendedContent?.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{opp.recommendedContent?.subtitle}</Typography>
                      </Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>~{opp.estimatedAudienceSize} users · {scopeLabel(opp.audienceScope)}</Typography>
                        <Button variant="contained" color="secondary" size="small" startIcon={<AutoAwesome />} onClick={() => handleConvertOpportunity(opp.id)} sx={{ flexShrink: 0 }}>Convert to draft</Button>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* Tab 2: 360 Analytics */}
        {activeTab === 2 && (
          <Box sx={{ p: 2.5 }}>
            {selectedAnalytics ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Conversion funnel</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{selectedAnalytics.campaignName}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3.5 }}>
                  {[
                    { l: 'Target audience', v: selectedAnalytics.targetCount.toLocaleString(), c: '#7C3AED' },
                    { l: 'Delivered', v: selectedAnalytics.deliveredCount.toLocaleString(), c: '#3B82F6' },
                    { l: `Impressions (CTR ${selectedAnalytics.ctrPercent}%)`, v: selectedAnalytics.impressionCount.toLocaleString(), c: '#F59E0B' },
                    { l: 'Conversions & revenue', v: `${selectedAnalytics.conversionCount} · $${Number(selectedAnalytics.attributedRevenue || 0).toLocaleString()}`, c: '#10B981' },
                  ].map((t) => (
                    <Box key={t.l} sx={{ p: 2, height: 96, borderRadius: '16px', border: '1px solid', borderColor: 'divider', borderLeft: `4px solid ${t.c}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.l}</Typography>
                      <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.4rem', color: t.c }}>{t.v}</Typography>
                    </Box>
                  ))}
                </Box>
                <Stack spacing={2.25}>
                  {funnel.map((f) => (
                    <Box key={f.label}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{f.label}</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: f.color }}>{f.raw}</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={Math.min(100, f.value)} sx={{ height: 10, borderRadius: 5, bgcolor: `${f.color}22`, '& .MuiLinearProgress-bar': { bgcolor: f.color, borderRadius: 5 } }} />
                    </Box>
                  ))}
                </Stack>
              </>
            ) : (
              <EmptyState title="No analytics yet" description="Analytics appear once a campaign has been delivered to its audience." />
            )}
          </Box>
        )}
      </GlassCard>

      {/* Campaign creation form */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', m: { xs: 1, sm: 3 }, maxHeight: 'calc(100% - 48px)', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Header */}
        <Box sx={{ position: 'relative', overflow: 'hidden', flexShrink: 0, minHeight: 104, display: 'flex', alignItems: 'center', px: 3.5, py: 2.5, color: '#fff', background: 'linear-gradient(120deg, #5B21B6 0%, #7C3AED 50%, #6366F1 100%)' }}>
          <TravelHeroArt sx={{ position: 'absolute', right: 70, top: '50%', transform: 'translateY(-50%)', width: 230, height: 140, opacity: 0.9, display: { xs: 'none', md: 'block' } }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative', width: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 48, height: 48, borderRadius: '15px', bgcolor: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CampaignIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.01em', lineHeight: 1.3, color: '#fff' }}>Create campaign</Typography>
                <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4, opacity: 0.85, color: '#fff' }}>Set the basics, choose who sees it, then write the message.</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setOpenCreateDialog(false)} sx={{ color: '#fff' }} aria-label="Close"><Close /></IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 0, bgcolor: 'background.default', flex: '1 1 auto', overflowY: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 3, p: { xs: 2, sm: 3.5 } }}>
            {/* ───── Left: form sections ───── */}
            <Stack spacing={3} sx={{ minWidth: 0 }}>
              {/* 1 · Basics */}
              <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>1</Box>
                  <Box><Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>Basics</Typography><Typography sx={{ fontSize: '0.78rem', lineHeight: 1.3 }} color="text.secondary">Name it and choose how it is triggered</Typography></Box>
                </Stack>
                <TextField
                  fullWidth required
                  label="Campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Summer European Getaways"
                  sx={{ mb: 2.5 }}
                />
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.06em', color: 'text.secondary' }}>HOW IS IT SENT?</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 1 }}>
                  {[
                    { v: 'DYNAMIC', icon: <FlashOn />, t: 'Dynamic', d: 'Triggered by a traveler action (ICCEE real-time)', c: '#7C3AED' },
                    { v: 'STATIC', icon: <CampaignIcon />, t: 'Static', d: 'Admin broadcast or scheduled push', c: '#3B82F6' },
                  ].map((o) => {
                    const on = newCampaign.paradigm === o.v;
                    return (
                      <Box
                        key={o.v}
                        role="button" tabIndex={0}
                        onClick={() => setNewCampaign({ ...newCampaign, paradigm: o.v as any })}
                        onKeyDown={(e) => e.key === 'Enter' && setNewCampaign({ ...newCampaign, paradigm: o.v as any })}
                        sx={{ p: 2, borderRadius: '16px', cursor: 'pointer', border: '2px solid', borderColor: on ? o.c : 'divider', bgcolor: on ? `${o.c}12` : 'transparent', display: 'flex', gap: 1.5, alignItems: 'center', transition: 'all .2s', '&:hover': { borderColor: o.c, transform: 'translateY(-2px)' } }}
                      >
                        <Box sx={{ width: 40, height: 40, borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${o.c}, ${o.c}bb)` }}>{o.icon}</Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.35 }}>{o.t}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', lineHeight: 1.35, color: 'text.secondary' }}>{o.d}</Typography>
                        </Box>
                        {on && <CheckCircle sx={{ color: o.c, ml: 'auto', flexShrink: 0 }} />}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* 2 · Audience */}
              <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>2</Box>
                  <Box><Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>Audience</Typography><Typography sx={{ fontSize: '0.78rem', lineHeight: 1.3 }} color="text.secondary">Who should receive this campaign?</Typography></Box>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, mb: 2.5 }}>
                  {[
                    { v: 'MASS_SEGMENT_AUDIENCE', icon: <Public />, t: 'All travelers', d: 'Every registered user', c: '#3B82F6' },
                    { v: 'DYNAMIC_SEGMENT', icon: <FlashOn />, t: 'Behavioral segment', d: 'Rule-based targeting', c: '#F59E0B' },
                    { v: 'MULTI_USER_BATCH', icon: <People />, t: 'Custom batch', d: 'Pick users or upload CSV', c: '#EC4899' },
                    { v: 'INDIVIDUAL_APP_USER', icon: <Person />, t: '1-to-1 user', d: 'VIP, direct reach, QA', c: '#10B981' },
                    { v: 'B2B_ENTERPRISE_ACCOUNT', icon: <BusinessCenter />, t: 'B2B accounts', d: 'Agencies & corporate portals', c: '#6366F1' },
                  ].map((o) => {
                    const on = newCampaign.audienceScope === o.v;
                    const pick = () => {
                      const updated = { ...newCampaign, audienceScope: o.v as any };
                      setNewCampaign(updated);
                      updateAudienceEstimate(updated);
                    };
                    return (
                      <Box
                        key={o.v}
                        role="button" tabIndex={0}
                        onClick={pick}
                        onKeyDown={(e) => e.key === 'Enter' && pick()}
                        sx={{ gridColumn: { sm: o.v === 'B2B_ENTERPRISE_ACCOUNT' ? 'span 2' : 'auto' }, p: 1.75, height: 76, borderRadius: '16px', cursor: 'pointer', border: '2px solid', borderColor: on ? o.c : 'divider', bgcolor: on ? `${o.c}12` : 'transparent', display: 'flex', gap: 1.5, alignItems: 'center', transition: 'all .2s', '&:hover': { borderColor: o.c, transform: 'translateY(-2px)' } }}
                      >
                        <Box sx={{ width: 38, height: 38, borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${o.c}, ${o.c}bb)` }}>{o.icon}</Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.35 }}>{o.t}</Typography>
                          <Typography noWrap sx={{ fontSize: '0.78rem', lineHeight: 1.35, color: 'text.secondary' }}>{o.d}</Typography>
                        </Box>
                        {on && <CheckCircle sx={{ color: o.c, ml: 'auto', flexShrink: 0 }} />}
                      </Box>
                    );
                  })}
                </Box>

                <Grid container spacing={2}>
            {/* Dynamic Rule Builder Section */}
            {newCampaign.audienceScope === 'DYNAMIC_SEGMENT' && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterAlt color="secondary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Dynamic Audience Rules (Cohort Filters)
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined" startIcon={<Add />} onClick={handleAddCondition}>
                      Add Filter Condition
                    </Button>
                  </Box>

                  <Stack spacing={1.5}>
                    {newCampaign.audienceRule?.conditions.map((cond, idx) => {
                      const attrConfig = TARGET_ATTRIBUTE_CONFIG[cond.field] || TARGET_ATTRIBUTE_CONFIG.destinationInterest;
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                          }}
                        >
                          <Chip label={`Rule ${idx + 1}`} size="small" color="primary" variant="outlined" />

                          {/* Field Selector with Grouped Categories */}
                          <TextField
                            select
                            size="small"
                            label="Target Attribute"
                            value={cond.field}
                            onChange={(e) => handleConditionChange(idx, 'field', e.target.value)}
                            sx={{ minWidth: 230 }}
                          >
                            <ListSubheader sx={{ fontWeight: 800, bgcolor: 'action.hover', lineHeight: '32px' }}>
                              👤 DEMOGRAPHICS & PROFILE
                            </ListSubheader>
                            {Object.entries(TARGET_ATTRIBUTE_CONFIG)
                              .filter(([_, config]) => config.category === 'Demographics & Profile')
                              .map(([key, config]) => (
                                <MenuItem key={key} value={key}>
                                  {config.label}
                                </MenuItem>
                              ))}

                            <ListSubheader sx={{ fontWeight: 800, bgcolor: 'action.hover', lineHeight: '32px' }}>
                              ✈️ TRAVEL & LIFESTYLE
                            </ListSubheader>
                            {Object.entries(TARGET_ATTRIBUTE_CONFIG)
                              .filter(([_, config]) => config.category === 'Travel & Lifestyle')
                              .map(([key, config]) => (
                                <MenuItem key={key} value={key}>
                                  {config.label}
                                </MenuItem>
                              ))}

                            <ListSubheader sx={{ fontWeight: 800, bgcolor: 'action.hover', lineHeight: '32px' }}>
                              📊 ACTIVITY & TELEMETRY
                            </ListSubheader>
                            {Object.entries(TARGET_ATTRIBUTE_CONFIG)
                              .filter(([_, config]) => config.category === 'Activity & Telemetry')
                              .map(([key, config]) => (
                                <MenuItem key={key} value={key}>
                                  {config.label}
                                </MenuItem>
                              ))}
                          </TextField>

                          {/* Context-Aware Operator Selector */}
                          <TextField
                            select
                            size="small"
                            label="Condition"
                            value={cond.operator}
                            onChange={(e) => handleConditionChange(idx, 'operator', e.target.value as any)}
                            sx={{ minWidth: 170 }}
                          >
                            {attrConfig.validOperators.map((op) => (
                              <MenuItem key={op.value} value={op.value}>
                                {op.label}
                              </MenuItem>
                            ))}
                          </TextField>

                          {/* Context-Aware Value Input */}
                          {attrConfig.type === 'enum' ? (
                            <TextField
                              select
                              size="small"
                              label="Filter Value"
                              value={cond.value || (attrConfig.options ? attrConfig.options[0].value : '')}
                              onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                              sx={{ flexGrow: 1 }}
                            >
                              {attrConfig.options?.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : attrConfig.type === 'number' ? (
                            <TextField
                              type="number"
                              inputProps={{ min: 0 }}
                              size="small"
                              label="Filter Value"
                              value={cond.value}
                              onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                              placeholder={attrConfig.placeholder}
                              sx={{ flexGrow: 1 }}
                            />
                          ) : (
                            <TextField
                              size="small"
                              label="Filter Value"
                              value={cond.value}
                              onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                              placeholder={attrConfig.placeholder}
                              sx={{ flexGrow: 1 }}
                            />
                          )}

                          {/* Remove button */}
                          <IconButton size="small" color="error" onClick={() => handleRemoveCondition(idx)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}

                    {(!newCampaign.audienceRule?.conditions || newCampaign.audienceRule.conditions.length === 0) && (
                      <Alert severity="info" sx={{ py: 0.5 }}>
                        No filters configured. All active platform users will qualify for this campaign.
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            )}

            {/* Individual App User: Search & Autocomplete */}
            {newCampaign.audienceScope === 'INDIVIDUAL_APP_USER' && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" /> Select Target Individual User
                  </Typography>

                  <Autocomplete
                    options={userSearchResults}
                    getOptionLabel={(opt) => `${opt.name} (${opt.email || opt.id})`}
                    loading={userSearchLoading}
                    onInputChange={(_, val) => handleUserSearch(val)}
                    onChange={(_, val) => {
                      const updated = {
                        ...newCampaign,
                        targetUserId: val ? val.id : '',
                      };
                      setNewCampaign(updated);
                      updateAudienceEstimate(updated);
                    }}
                    renderOption={(props, opt) => (
                      <li {...props} key={opt.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Avatar src={opt.picture} sx={{ width: 32, height: 32 }}>
                            {opt.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {opt.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {opt.email} • ID: {opt.id}
                            </Typography>
                          </Box>
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search User by Name, Email, or ID..."
                        placeholder="Type to search travelers..."
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {userSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />

                  {newCampaign.targetUserId && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Selected Target User ID:
                      </Typography>
                      <Chip label={newCampaign.targetUserId} size="small" color="primary" />
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Multi-User Batch / CSV Upload Targeting */}
            {newCampaign.audienceScope === 'MULTI_USER_BATCH' && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupAdd color="secondary" /> Select Multiple Target Users or Upload CSV
                    </Typography>

                    <Button variant="outlined" component="label" size="small" startIcon={<UploadFile />}>
                      Upload User IDs (.CSV / .TXT)
                      <input type="file" hidden accept=".csv,.txt" onChange={handleCsvFileUpload} />
                    </Button>
                  </Box>

                  {csvUploadInfo && (
                    <Alert severity="success" sx={{ mb: 1.5, py: 0.5 }}>
                      {csvUploadInfo}
                    </Alert>
                  )}

                  {/* Autocomplete Multi-select */}
                  <Autocomplete
                    multiple
                    options={userSearchResults}
                    getOptionLabel={(opt) => opt.name || opt.email}
                    loading={userSearchLoading}
                    onInputChange={(_, val) => handleUserSearch(val)}
                    onChange={(_, val) => {
                      setSelectedUsers(val);
                      const ids = val.map((u) => u.id);
                      const updated = {
                        ...newCampaign,
                        targetUserIds: ids,
                      };
                      setNewCampaign(updated);
                      updateAudienceEstimate(updated);
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          avatar={<Avatar src={option.picture}>{option.name.charAt(0)}</Avatar>}
                          label={`${option.name} (${option.email})`}
                          size="small"
                          {...getTagProps({ index })}
                          key={option.id}
                        />
                      ))
                    }
                    renderOption={(props, opt) => (
                      <li {...props} key={opt.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Avatar src={opt.picture} sx={{ width: 32, height: 32 }}>
                            {opt.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {opt.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {opt.email} • ID: {opt.id}
                            </Typography>
                          </Box>
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Add Individual Users to Batch"
                        placeholder="Search by Name or Email..."
                      />
                    )}
                  />

                  {newCampaign.targetUserIds && newCampaign.targetUserIds.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Total Selected Users: <strong>{newCampaign.targetUserIds.length}</strong>
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {/* B2B Enterprise Account */}
            {newCampaign.audienceScope === 'B2B_ENTERPRISE_ACCOUNT' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Target Corporate Account ID / Partner Code"
                  placeholder="e.g. CORP_AMADEUS_GLOBAL or AGENCY_APAC_01"
                  value={newCampaign.targetCorporateAccountId || ''}
                  onChange={(e) => {
                    const updated = { ...newCampaign, targetCorporateAccountId: e.target.value };
                    setNewCampaign(updated);
                    updateAudienceEstimate(updated);
                  }}
                />
              </Grid>
            )}

                </Grid>
              </Box>

              {/* 3 · Creative */}
              <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>3</Box>
                  <Box><Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>Message</Typography><Typography sx={{ fontSize: '0.78rem', lineHeight: 1.3 }} color="text.secondary">What travelers will see</Typography></Box>
                </Stack>
                <Stack spacing={2.25}>
                  <TextField
                    fullWidth
                    label="Title"
                    placeholder="e.g. Hi {{firstName}}, your {{destination}} trip is waiting!"
                    value={newCampaign.content?.web?.title || ''}
                    onChange={(e) => setNewCampaign({ ...newCampaign, content: { ...newCampaign.content, web: { ...newCampaign.content?.web!, title: e.target.value } } })}
                    helperText="Tip: use {{firstName}} and {{destination}} to personalise for each traveler"
                  />
                  <TextField
                    fullWidth multiline rows={3}
                    label="Subtitle / promotional offer"
                    placeholder="Discover tailored travel deals and save 15% on your booking this week."
                    value={newCampaign.content?.web?.subtitle || ''}
                    onChange={(e) => setNewCampaign({ ...newCampaign, content: { ...newCampaign.content, web: { ...newCampaign.content?.web!, subtitle: e.target.value } } })}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Button text"
                      value={newCampaign.content?.web?.ctaText || 'Explore Deals'}
                      onChange={(e) => setNewCampaign({ ...newCampaign, content: { ...newCampaign.content, web: { ...newCampaign.content?.web!, ctaText: e.target.value } } })}
                    />
                    <TextField
                      fullWidth
                      label="Button link"
                      value={newCampaign.content?.web?.ctaLink || '/itinerary/create'}
                      onChange={(e) => setNewCampaign({ ...newCampaign, content: { ...newCampaign.content, web: { ...newCampaign.content?.web!, ctaLink: e.target.value } } })}
                    />
                  </Box>
                </Stack>
              </Box>
            </Stack>

            {/* ───── Right: sticky forecast + live preview ───── */}
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 28 }, alignSelf: 'start' }}>
              <Stack spacing={2.5}>
                <Box sx={{ p: 2.5, borderRadius: '20px', color: '#fff', background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', boxShadow: '0 18px 36px -18px rgba(124,58,237,.8)' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, opacity: 0.9 }}>
                    <AutoAwesome sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em', color: '#fff' }}>AUDIENCE FORECAST</Typography>
                  </Stack>
                  <Typography sx={{ fontWeight: 800, fontSize: '2.3rem', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff' }}>
                    {estimatingAudience ? <CircularProgress size={26} sx={{ color: '#fff' }} /> : `~${(audienceEstimate?.estimatedAudienceSize || 0).toLocaleString()}`}
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', opacity: 0.9, mt: 0.5, color: '#fff' }}>
                    {audienceEstimate?.percentageOfTotal || 0}% of {(audienceEstimate?.totalUsers ?? 0).toLocaleString()} total users
                  </Typography>
                  <LinearProgress variant="determinate" value={Math.min(100, Number(audienceEstimate?.percentageOfTotal) || 0)} sx={{ mt: 1.5, height: 6, borderRadius: 4, bgcolor: 'rgba(255,255,255,.25)', '& .MuiLinearProgress-bar': { bgcolor: '#fff', borderRadius: 4 } }} />
                  <Typography sx={{ fontSize: '0.78rem', opacity: 0.85, mt: 1.5, lineHeight: 1.4, color: '#fff' }}>
                    {newCampaign.audienceScope === 'MASS_SEGMENT_AUDIENCE' && 'Delivering across all active travelers registered on the platform.'}
                    {newCampaign.audienceScope === 'DYNAMIC_SEGMENT' && 'Users matched dynamically against your behavioral & travel-intent rules.'}
                    {newCampaign.audienceScope === 'MULTI_USER_BATCH' && `Targeting a custom list of ${newCampaign.targetUserIds?.length || 0} designated users.`}
                    {newCampaign.audienceScope === 'INDIVIDUAL_APP_USER' && '1-to-1 personal campaign delivered only to the selected user.'}
                    {newCampaign.audienceScope === 'B2B_ENTERPRISE_ACCOUNT' && 'Delivered to corporate traveler accounts and partner travel desks.'}
                  </Typography>
                </Box>

                <Box sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.06em', color: 'text.secondary' }}>LIVE PREVIEW</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 14px 30px -14px rgba(0,0,0,.35)' }}>
                      <Box sx={{ position: 'relative', height: 92, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>
                        <TravelHeroArt sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.9 }} />
                      </Box>
                      <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.3, wordBreak: 'break-word' }}>
                          {(newCampaign.content?.web?.title || 'Your campaign title appears here').replace(/{{\s*firstName\s*}}/g, 'Alex').replace(/{{\s*destination\s*}}/g, 'Tokyo')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, wordBreak: 'break-word' }}>
                          {(newCampaign.content?.web?.subtitle || 'Your subtitle or offer appears here.').replace(/{{\s*firstName\s*}}/g, 'Alex').replace(/{{\s*destination\s*}}/g, 'Tokyo')}
                        </Typography>
                        <Box sx={{ mt: 1.75, display: 'inline-block', px: 2.25, py: 0.9, borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                          {newCampaign.content?.web?.ctaText || 'Explore Deals'}
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                      Sample values ("Alex", "Tokyo") are shown for personalisation tokens.
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3.5, py: 2, flexShrink: 0, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">{newCampaign.name?.trim() ? 'Saved as a draft — you can submit it for approval afterwards.' : 'Give your campaign a name to save it.'}</Typography>
          <Stack direction="row" spacing={1.5}>
            <Button onClick={() => setOpenCreateDialog(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button variant="contained" size="large" onClick={handleCreateCampaign} disabled={!newCampaign.name?.trim()} sx={{ px: 3.5, fontWeight: 800 }}>
              Save campaign draft
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
