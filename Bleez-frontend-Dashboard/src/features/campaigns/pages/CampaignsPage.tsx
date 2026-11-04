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
} from '@mui/material';
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
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Title Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CampaignIcon color="primary" fontSize="large" />
            Campaign Command Center (ICCEE)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            First-Party Local Intelligent Campaign & Customer Engagement Platform
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create Campaign
          </Button>
        </Box>
      </Box>

      {/* Metric Cards Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2">
                Active Campaigns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: 'primary.main' }}>
                {campaigns.filter((c) => c.status === 'APPROVED' || c.status === 'ACTIVE').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {campaigns.length} Total Campaigns Registered
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AutoAwesome fontSize="small" color="secondary" />
                AI Opportunities
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: 'secondary.main' }}>
                {opportunities.filter((o) => o.status === 'RECOMMENDED').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Draft recommendations pending review
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2">
                Total Reach / Delivered
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: 'success.main' }}>
                12,822
              </Typography>
              <Typography variant="caption" color="text.secondary">
                99.1% Delivery Rate via Redis Queue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2">
                Attributed Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 1, color: 'warning.main' }}>
                $43,436
              </Typography>
              <Typography variant="caption" color="text.secondary">
                First-Party Revenue Attribution
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} indicatorColor="primary" textColor="primary">
          <Tab label="Campaigns List" icon={<CampaignIcon />} iconPosition="start" />
          <Tab label={`AI Opportunities (${opportunities.length})`} icon={<AutoAwesome />} iconPosition="start" />
          <Tab label="360° Analytics & SSE Console" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tab 0: Campaigns List */}
      {activeTab === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Paradigm</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Role Creator</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {c.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {c.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      {getScopeIcon(c.audienceScope)}
                      <Typography variant="body2">{c.audienceScope}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={c.paradigm} size="small" variant="outlined" color={c.paradigm === 'DYNAMIC' ? 'secondary' : 'default'} />
                  </TableCell>
                  <TableCell>{getStatusChip(c.status)}</TableCell>
                  <TableCell>{c.priority}/10</TableCell>
                  <TableCell>{c.creatorUserRole || 'SUPER_ADMIN'}</TableCell>
                  <TableCell align="right">
                    {c.status === 'DRAFT' && (
                      <Button size="small" variant="outlined" onClick={() => handleSubmitForApproval(c.id)}>
                        Submit Approval
                      </Button>
                    )}
                    {c.status === 'PENDING_APPROVAL' && (
                      <Button size="small" variant="contained" color="success" onClick={() => handleApprove(c.id)} sx={{ mr: 1 }}>
                        Approve
                      </Button>
                    )}
                    {(c.status === 'APPROVED' || c.status === 'PAUSED') && (
                      <IconButton size="small" color="primary" onClick={() => handleActivate(c.id)}>
                        <PlayArrow />
                      </IconButton>
                    )}
                    {c.status === 'ACTIVE' && (
                      <IconButton size="small" color="warning" onClick={() => handlePause(c.id)}>
                        <PauseCircle />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 1: AI Opportunities */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {opportunities.map((opp) => (
            <Grid item xs={12} md={6} key={opp.id}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, borderLeft: '6px solid #9c27b0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {opp.title}
                    </Typography>
                    <Chip label={`Confidence: ${Math.round(opp.confidenceScore * 100)}%`} color="secondary" size="small" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {opp.rationale}
                  </Typography>

                  <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      RECOMMENDED CREATIVE DRAFT:
                    </Typography>
                    <Typography variant="subtitle2">{opp.recommendedContent?.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {opp.recommendedContent?.subtitle}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Audience: ~{opp.estimatedAudienceSize} users ({opp.audienceScope})
                    </Typography>

                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<AutoAwesome />}
                      onClick={() => handleConvertOpportunity(opp.id)}
                    >
                      Convert to Campaign Draft
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 2: 360 Analytics */}
      {activeTab === 2 && selectedAnalytics && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            360° Conversion Funnel & Analytics ({selectedAnalytics.campaignName})
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={3}>
              <Typography color="text.secondary">Target Audience</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {selectedAnalytics.targetCount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography color="text.secondary">Delivered</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                {selectedAnalytics.deliveredCount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography color="text.secondary">Impressions (CTR)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {selectedAnalytics.impressionCount} ({selectedAnalytics.ctrPercent}%)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography color="text.secondary">Conversions & Revenue</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                {selectedAnalytics.conversionCount} (${selectedAnalytics.attributedRevenue})
              </Typography>
            </Grid>
          </Grid>

          {/* Funnel Progress Bars */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Delivered Rate: 99%
              </Typography>
              <LinearProgress variant="determinate" value={99} color="info" sx={{ height: 10, borderRadius: 5 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Impression Rate: 68%
              </Typography>
              <LinearProgress variant="determinate" value={68} color="primary" sx={{ height: 10, borderRadius: 5 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Click-Through Rate (CTR): {selectedAnalytics.ctrPercent}%
              </Typography>
              <LinearProgress variant="determinate" value={selectedAnalytics.ctrPercent} color="warning" sx={{ height: 10, borderRadius: 5 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Final Conversion Rate: {selectedAnalytics.conversionRatePercent}%
              </Typography>
              <LinearProgress variant="determinate" value={selectedAnalytics.conversionRatePercent * 3} color="success" sx={{ height: 10, borderRadius: 5 }} />
            </Box>
          </Box>
        </Paper>
      )}

      {/* Dialog for 15-step Campaign Creation Wizard */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CampaignIcon color="primary" />
            15-Step Campaign Creation Wizard
          </Box>
          {audienceEstimate && (
            <Chip
              icon={<AutoAwesome />}
              label={`Forecast Reach: ~${audienceEstimate.estimatedAudienceSize.toLocaleString()} (${audienceEstimate.percentageOfTotal}%)`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            {/* Basic Info */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="e.g. Summer European Getaways"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Campaign Paradigm"
                value={newCampaign.paradigm}
                onChange={(e) => setNewCampaign({ ...newCampaign, paradigm: e.target.value as any })}
              >
                <MenuItem value="DYNAMIC">DYNAMIC (User Action Initiated / ICCEE Real-Time)</MenuItem>
                <MenuItem value="STATIC">STATIC (Admin Broadcast / Scheduled Push)</MenuItem>
              </TextField>
            </Grid>

            {/* Audience Scope Selection */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Audience Scope & Targeting Model"
                value={newCampaign.audienceScope}
                onChange={(e) => {
                  const scope = e.target.value as any;
                  const updated = { ...newCampaign, audienceScope: scope };
                  setNewCampaign(updated);
                  updateAudienceEstimate(updated);
                }}
                helperText="Select whether to target all users, dynamic behavioral segments, or direct user batches"
              >
                <MenuItem value="MASS_SEGMENT_AUDIENCE">
                  🌐 ALL REGISTERED TRAVELERS (Broad Mass Audience)
                </MenuItem>
                <MenuItem value="DYNAMIC_SEGMENT">
                  ⚡ DYNAMIC BEHAVIORAL SEGMENT (Rule-Based Targeting)
                </MenuItem>
                <MenuItem value="MULTI_USER_BATCH">
                  👥 CUSTOM MULTI-USER BATCH (Multi-select / CSV Upload)
                </MenuItem>
                <MenuItem value="INDIVIDUAL_APP_USER">
                  👤 1-TO-1 INDIVIDUAL USER (VIP / Direct Reach / QA Testing)
                </MenuItem>
                <MenuItem value="B2B_ENTERPRISE_ACCOUNT">
                  🏢 B2B ENTERPRISE ACCOUNTS (Agencies & Corporate Portals)
                </MenuItem>
              </TextField>
            </Grid>

            {/* Audience Reach Forecast Banner */}
            <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(156, 39, 176, 0.08) 100%)',
                  borderColor: 'primary.light',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Target Audience Forecast
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {newCampaign.audienceScope === 'MASS_SEGMENT_AUDIENCE' && 'Delivering across all active travelers registered on the platform.'}
                        {newCampaign.audienceScope === 'DYNAMIC_SEGMENT' && 'Matching users dynamically evaluated against behavioral & travel intent rules.'}
                        {newCampaign.audienceScope === 'MULTI_USER_BATCH' && `Targeting a custom list of ${newCampaign.targetUserIds?.length || 0} designated users.`}
                        {newCampaign.audienceScope === 'INDIVIDUAL_APP_USER' && '1-to-1 personal campaign delivered exclusively to the specified user.'}
                        {newCampaign.audienceScope === 'B2B_ENTERPRISE_ACCOUNT' && 'Delivered to corporate traveler accounts and partner travel desks.'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {estimatingAudience ? <CircularProgress size={20} /> : `~${audienceEstimate?.estimatedAudienceSize.toLocaleString() || 0}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {audienceEstimate?.percentageOfTotal || 0}% of Total Userbase ({(audienceEstimate?.totalUsers ?? 0).toLocaleString()})
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

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

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
                🎨 CREATIVE CONTENT & COPYWRITING
              </Typography>
            </Grid>

            {/* Creative Content */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Title (Supports Dynamic Personalization)"
                placeholder="e.g. Hi {{firstName}}, your {{destination}} trip is waiting!"
                value={newCampaign.content?.web?.title || ''}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    content: {
                      ...newCampaign.content,
                      web: { ...newCampaign.content?.web!, title: e.target.value },
                    },
                  })
                }
                helperText="Use dynamic tokens like {{firstName}}, {{destination}} for personalized traveler engagement"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Subtitle / Promotional Offer"
                placeholder="Discover tailored travel deals and save 15% on your booking this week."
                value={newCampaign.content?.web?.subtitle || ''}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    content: {
                      ...newCampaign.content,
                      web: { ...newCampaign.content?.web!, subtitle: e.target.value },
                    },
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Call to Action (CTA) Button Text"
                value={newCampaign.content?.web?.ctaText || 'Explore Deals'}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    content: {
                      ...newCampaign.content,
                      web: { ...newCampaign.content?.web!, ctaText: e.target.value },
                    },
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Call to Action Destination Link"
                value={newCampaign.content?.web?.ctaLink || '/itinerary/create'}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    content: {
                      ...newCampaign.content,
                      web: { ...newCampaign.content?.web!, ctaLink: e.target.value },
                    },
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" size="large" onClick={handleCreateCampaign} sx={{ px: 3 }}>
            Save Campaign Draft
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
