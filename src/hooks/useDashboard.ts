import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardData } from '../services/dashboardService';

interface UseDashboardOptions {
  months?: number;
  year?: number;
  activityLimit?: number;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

export const useDashboard = (options: UseDashboardOptions = {}) => {
  const {
    months = 6,
    year,
    activityLimit = 10,
    refreshInterval = 300000, // 5 minutes
    autoRefresh = false
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const dashboardData = await dashboardService.loadAllData({
        months,
        year,
        activityLimit
      });

      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [months, year, activityLimit]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
};