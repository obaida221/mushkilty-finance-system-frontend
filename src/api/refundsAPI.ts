import api from '../config/axios';
import type { Refund } from '../types';

export interface CreateRefundDto {
  payment_id: number;
  reason?: string;
  refunded_at?: string; // ISO date string
}

export interface UpdateRefundDto {
  payment_id?: number;
  reason?: string;
  refunded_at?: string;
}

// Refunds API
export const refundsAPI = {
  getAll: () => api.get<Refund[]>('/refunds'),
  getById: (id: number) => api.get<Refund>(`/refunds/${id}`),
  create: (refundData: CreateRefundDto) => api.post<Refund>('/refunds', refundData),
  update: (id: number, refundData: UpdateRefundDto) => api.patch<Refund>(`/refunds/${id}`, refundData),
  delete: (id: number) => api.delete<void>(`/refunds/${id}`),
};

export default refundsAPI;