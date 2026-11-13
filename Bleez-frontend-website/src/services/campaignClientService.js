/**
 * Customer Campaign Client Service
 * Communicates with customer-facing Backend APIs (/api/campaigns/eligible)
 */

// Empty means same-origin ("/api/..."), which is how the production nginx proxies the backend.
const getBackendUrl = () => process.env.REACT_APP_BACKEND_URL || '';

export async function fetchEligibleCampaigns(placement = 'HOME_HERO', platform = 'WEB') {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('session');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/campaigns/eligible?platform=${platform}&placement=${placement}`;
    console.log('[CampaignService] Fetching customer campaigns from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn('[CampaignService] Non-200 status:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('[CampaignService] Campaigns received:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[CampaignService] Error fetching campaigns:', error);
    return [];
  }
}
