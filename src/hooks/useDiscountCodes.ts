import { useState, useEffect } from 'react';
import { discountCodesAPI } from '../api/discountCodesAPI';
import type { DiscountCode } from '../types/discount';

export const useDiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscountCodes = async () => {
    try {
      setLoading(true);
      const response = await discountCodesAPI.getAll();
      setDiscountCodes(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch discount codes');
      console.error('Error fetching discount codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  return {
    discountCodes,
    loading,
    error,
    refetch: fetchDiscountCodes,
  };
};
