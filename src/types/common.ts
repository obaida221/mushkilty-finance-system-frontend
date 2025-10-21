// أنواع مشتركة بين جميع الكيانات
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type Currency = 'USD' | 'IQD';
