import { apiClient } from '@/services/apiClient';
import { Watermark, WatermarkRule, WatermarkTestResult } from '../types/watermark.types';

export const watermarkService = {
  getAllWatermarks: async (): Promise<Watermark[]> => {
    const res = await apiClient.get('/admin/watermarks');
    return res.data;
  },

  createWatermark: async (wm: Watermark): Promise<Watermark> => {
    const res = await apiClient.post('/admin/watermarks', wm);
    return res.data;
  },

  updateWatermark: async (id: string, wm: Watermark): Promise<Watermark> => {
    const res = await apiClient.put(`/admin/watermarks/${id}`, wm);
    return res.data;
  },

  deleteWatermark: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/watermarks/${id}`);
  },

  getAllRules: async (): Promise<WatermarkRule[]> => {
    const res = await apiClient.get('/admin/watermarks/rules');
    return res.data;
  },

  createRule: async (rule: WatermarkRule): Promise<WatermarkRule> => {
    const res = await apiClient.post('/admin/watermarks/rules', rule);
    return res.data;
  },

  updateRule: async (id: string, rule: WatermarkRule): Promise<WatermarkRule> => {
    const res = await apiClient.put(`/admin/watermarks/rules/${id}`, rule);
    return res.data;
  },

  deleteRule: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/watermarks/rules/${id}`);
  },

  testWatermarkRule: async (context: any): Promise<WatermarkTestResult> => {
    const res = await apiClient.post('/admin/watermarks/test', context);
    return res.data;
  },
};
