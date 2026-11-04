import { apiClient } from '@/services/apiClient';
import { B2bOrganization } from '../types/b2b.types';

export const b2bService = {
  getMyOrganization: async (): Promise<B2bOrganization | null> => {
    const res = await apiClient.get('/b2b/organization');
    return res.data;
  },

  saveOrganization: async (org: B2bOrganization): Promise<B2bOrganization> => {
    const res = await apiClient.post('/b2b/organization', org);
    return res.data;
  },
};
