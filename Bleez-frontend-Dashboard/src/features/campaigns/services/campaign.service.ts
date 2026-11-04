import { apiClient } from '@/services/apiClient';
import { Campaign, CampaignOpportunity, CampaignAnalytics, UserSearchResult, AudienceEstimate } from '../types/campaign.types';

export const campaignService = {
  // Admin Endpoints
  async getAllCampaigns(): Promise<Campaign[]> {
    const response = await apiClient.get<Campaign[]>('/admin/campaigns');
    return response.data;
  },

  async searchUsers(query: string = ''): Promise<UserSearchResult[]> {
    const response = await apiClient.get<UserSearchResult[]>('/admin/campaigns/users/search', {
      params: { q: query },
    });
    return response.data;
  },

  async estimateAudience(campaignDraft: Partial<Campaign>): Promise<AudienceEstimate> {
    const response = await apiClient.post<AudienceEstimate>('/admin/campaigns/estimate-audience', campaignDraft);
    return response.data;
  },

  async getCampaignById(id: string): Promise<Campaign> {
    const response = await apiClient.get<Campaign>(`/admin/campaigns/${id}`);
    return response.data;
  },

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await apiClient.post<Campaign>('/admin/campaigns', campaign);
    return response.data;
  },

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await apiClient.put<Campaign>(`/admin/campaigns/${id}`, campaign);
    return response.data;
  },

  async submitForApproval(id: string): Promise<Campaign> {
    const response = await apiClient.post<Campaign>(`/admin/campaigns/${id}/submit`);
    return response.data;
  },

  async approveCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post<Campaign>(`/admin/campaigns/${id}/approve`);
    return response.data;
  },

  async rejectCampaign(id: string, reason?: string): Promise<Campaign> {
    const response = await apiClient.post<Campaign>(`/admin/campaigns/${id}/reject`, { reason });
    return response.data;
  },

  async activateCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post<Campaign>(`/admin/campaigns/${id}/activate`);
    return response.data;
  },

  async pauseCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post<Campaign>(`/admin/campaigns/${id}/pause`);
    return response.data;
  },

  // AI Campaign Opportunities Endpoints
  async getRecommendedOpportunities(): Promise<CampaignOpportunity[]> {
    const response = await apiClient.get<CampaignOpportunity[]>('/admin/campaigns/opportunities');
    return response.data;
  },

  async convertOpportunityToDraft(id: string): Promise<Campaign> {
    const response = await apiClient.post<Campaign>(`/admin/campaigns/opportunities/${id}/convert`);
    return response.data;
  },

  async rejectOpportunity(id: string): Promise<CampaignOpportunity> {
    const response = await apiClient.post<CampaignOpportunity>(`/admin/campaigns/opportunities/${id}/reject`);
    return response.data;
  },

  // 360 Analytics Endpoints
  async getCampaignAnalytics(id: string): Promise<CampaignAnalytics> {
    const response = await apiClient.get<CampaignAnalytics>(`/admin/campaigns/analytics/${id}`);
    return response.data;
  },

  // Client Feed API
  async getEligibleCampaigns(scope?: string, platform: string = 'WEB', placement?: string): Promise<Campaign[]> {
    const response = await apiClient.get<Campaign[]>('/campaigns/eligible', {
      params: { scope, platform, placement },
    });
    return response.data;
  },
};
