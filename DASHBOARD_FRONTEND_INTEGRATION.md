# Dashboard API - Frontend Integration Guide

## Overview

This guide provides complete frontend integration instructions for the Dashboard API endpoints. It includes ready-to-use code examples, data structures, and best practices for integrating with your React dashboard.

## Quick Start

### 1. Base API Configuration

```javascript
// config/api.js
export const API_CONFIG = {
  baseURL: 'http://localhost:3001',
  endpoints: {
    dashboard: {
      stats: '/dashboard/stats',
      revenueChart: '/dashboard/revenue-chart',
      enrollmentChart: '/dashboard/student-enrollment-chart',
      courseDistribution: '/dashboard/course-distribution-chart',
      paymentMethods: '/dashboard/payment-method-chart',
      financialSummary: '/dashboard/financial-summary',
      recentActivities: '/dashboard/recent-activities'
    }
  }
};
```

### 2. Dashboard Service

```javascript
// services/dashboardService.js
import { API_CONFIG } from '../config/api';

class DashboardService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Dashboard API Error:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getStats() {
    return await this.request(API_CONFIG.endpoints.dashboard.stats);
  }

  // Get revenue chart data
  async getRevenueChart(months = 6) {
    return await this.request(`${API_CONFIG.endpoints.dashboard.revenueChart}?months=${months}`);
  }

  // Get student enrollment chart data  
  async getEnrollmentChart(months = 6) {
    return await this.request(`${API_CONFIG.endpoints.dashboard.enrollmentChart}?months=${months}`);
  }

  // Get course distribution data
  async getCourseDistribution() {
    return await this.request(API_CONFIG.endpoints.dashboard.courseDistribution);
  }

  // Get payment methods data
  async getPaymentMethods(months = 6) {
    return await this.request(`${API_CONFIG.endpoints.dashboard.paymentMethods}?months=${months}`);
  }

  // Get financial summary
  async getFinancialSummary(year) {
    const yearParam = year ? `?year=${year}` : '';
    return await this.request(`${API_CONFIG.endpoints.dashboard.financialSummary}${yearParam}`);
  }

  // Get recent activities
  async getRecentActivities(limit = 10) {
    return await this.request(`${API_CONFIG.endpoints.dashboard.recentActivities}?limit=${limit}`);
  }

  // Load all dashboard data at once
  async loadAllData(options = {}) {
    const { months = 6, year, activityLimit = 10 } = options;
    
    try {
      const [
        stats,
        revenueChart,
        enrollmentChart,
        courseDistribution,
        paymentMethods,
        financialSummary,
        recentActivities
      ] = await Promise.all([
        this.getStats(),
        this.getRevenueChart(months),
        this.getEnrollmentChart(months),
        this.getCourseDistribution(),
        this.getPaymentMethods(months),
        this.getFinancialSummary(year),
        this.getRecentActivities(activityLimit)
      ]);

      return {
        stats,
        charts: {
          revenue: revenueChart,
          enrollment: enrollmentChart,
          courseDistribution,
          paymentMethods
        },
        financialSummary,
        recentActivities
      };
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
```

## Data Structures & Types

### TypeScript Interfaces

```typescript
// types/dashboard.ts

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  activeStudents: number;
  netProfit: number;
  incomeChange: string;
  expensesChange: string;
  studentsChange: string;
  profitChange: string;
}

export interface RevenueChartData {
  month: string;
  income: number;
  expenses: number;
}

export interface EnrollmentChartData {
  month: string;
  students: number;
}

export interface CourseDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface PaymentMethodData {
  method: string;
  amount: number;
}

export interface MonthlyBreakdown {
  month: number;
  income: number;
  expenses: number;
  profit: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
}

export interface FinancialSummary {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  monthlyBreakdown: MonthlyBreakdown[];
  expenseCategories: ExpenseCategory[];
}

export interface RecentActivity {
  type: 'payment' | 'enrollment' | 'expense';
  id: number;
  date: string;
  description: string;
  amount?: number;
  currency?: string;
  method?: string;
  status?: string;
  batch?: string;
  category?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: {
    revenue: RevenueChartData[];
    enrollment: EnrollmentChartData[];
    courseDistribution: CourseDistributionData[];
    paymentMethods: PaymentMethodData[];
  };
  financialSummary: FinancialSummary;
  recentActivities: RecentActivity[];
}
```

## React Hook Implementation

### Custom Dashboard Hook

```typescript
// hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardData } from '../types/dashboard';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
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
```

### Individual Data Hooks

```typescript
// hooks/useDashboardStats.ts
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types/dashboard';

export const useDashboardStats = (refreshInterval?: number) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    if (refreshInterval) {
      const interval = setInterval(loadStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return { stats, loading, error, refresh: loadStats };
};
```

## Complete React Dashboard Component

```tsx
// components/Dashboard/Dashboard.tsx
import React from 'react';
import { Box, Typography, Grid, Alert, CircularProgress } from '@mui/material';
import { useDashboard } from '../../hooks/useDashboard';
import StatsCards from './StatsCards';
import RevenueChart from './RevenueChart';
import EnrollmentChart from './EnrollmentChart';
import CourseDistributionChart from './CourseDistributionChart';
import PaymentMethodChart from './PaymentMethodChart';
import RecentActivities from './RecentActivities';
import RefreshButton from './RefreshButton';

const Dashboard: React.FC = () => {
  const { data, loading, error, lastUpdated, refresh } = useDashboard({
    months: 6,
    activityLimit: 10,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  });

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          جاري تحميل لوحة التحكم...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">خطأ في تحميل البيانات</Typography>
        <Typography variant="body2">{error}</Typography>
        <RefreshButton onClick={refresh} />
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="warning" sx={{ m: 3 }}>
        <Typography>لا توجد بيانات متاحة</Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          لوحة التحكم
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              آخر تحديث: {lastUpdated.toLocaleTimeString('ar-IQ')}
            </Typography>
          )}
          <RefreshButton onClick={refresh} loading={loading} />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatsCards stats={data.stats} />
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <RevenueChart data={data.charts.revenue} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <CourseDistributionChart data={data.charts.courseDistribution} />
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <EnrollmentChart data={data.charts.enrollment} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <PaymentMethodChart data={data.charts.paymentMethods} />
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <RecentActivities activities={data.recentActivities} />
    </Box>
  );
};

export default Dashboard;
```

## Chart Components

### Stats Cards Component

```tsx
// components/Dashboard/StatsCards.tsx
import React from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import { TrendingUp, TrendingDown, School, AccountBalance } from '@mui/icons-material';
import { DashboardStats } from '../../types/dashboard';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statsConfig = [
    {
      title: 'إجمالي الدخل',
      value: `${stats.totalIncome.toLocaleString()} د.ع`,
      change: stats.incomeChange,
      isPositive: stats.incomeChange.includes('+'),
      icon: <TrendingUp />,
      color: '#10B981'
    },
    {
      title: 'إجمالي المصروفات',
      value: `${stats.totalExpenses.toLocaleString()} د.ع`,
      change: stats.expensesChange,
      isPositive: !stats.expensesChange.includes('+'),
      icon: <TrendingDown />,
      color: '#EF4444'
    },
    {
      title: 'الطلاب النشطين',
      value: stats.activeStudents.toString(),
      change: stats.studentsChange,
      isPositive: stats.studentsChange.includes('+'),
      icon: <School />,
      color: '#3B82F6'
    },
    {
      title: 'صافي الربح',
      value: `${stats.netProfit.toLocaleString()} د.ع`,
      change: stats.profitChange,
      isPositive: stats.profitChange.includes('+'),
      icon: <AccountBalance />,
      color: '#DC2626'
    }
  ];

  return (
    <>
      {statsConfig.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: `${stat.color}20`,
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {React.cloneElement(stat.icon, { sx: { fontSize: 28, color: stat.color } })}
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                {stat.isPositive ? (
                  <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
                )}
                <Typography variant="body2" color={stat.isPositive ? 'success.main' : 'error.main'}>
                  {stat.change}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  من الشهر الماضي
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};

export default StatsCards;
```

### Revenue Chart Component

```tsx
// components/Dashboard/RevenueChart.tsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RevenueChartData } from '../../types/dashboard';

interface RevenueChartProps {
  data: RevenueChartData[];
  loading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading = false }) => {
  const formatTooltip = (value: any, name: string) => {
    const arabicNames = {
      income: 'الدخل',
      expenses: 'المصروفات'
    };
    return [`${value.toLocaleString()} د.ع`, arabicNames[name] || name];
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>جاري تحميل البيانات...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight={600} mb={3}>
        الدخل والمصروفات
      </Typography>
      <Box sx={{ direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="month" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" tickFormatter={(value) => value.toLocaleString()} />
            <Tooltip
              formatter={formatTooltip}
              labelStyle={{ direction: 'rtl' }}
              contentStyle={{
                backgroundColor: '#1E293B',
                color: '#94A3B8',
                border: '1px solid #334155',
                borderRadius: '8px',
                direction: 'rtl',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10B981" 
              strokeWidth={2} 
              name="الدخل"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={2} 
              name="المصروفات"
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default RevenueChart;
```

### Course Distribution Chart

```tsx
// components/Dashboard/CourseDistributionChart.tsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CourseDistributionData } from '../../types/dashboard';

interface CourseDistributionChartProps {
  data: CourseDistributionData[];
  loading?: boolean;
}

const CourseDistributionChart: React.FC<CourseDistributionChartProps> = ({ data, loading = false }) => {
  const renderLabel = ({ name, percent }: any) => {
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>جاري تحميل البيانات...</Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>لا توجد بيانات دورات متاحة</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight={600} mb={3}>
        توزيع الدورات
      </Typography>
      <Box sx={{ direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: string) => [value, name]}
              contentStyle={{
                backgroundColor: '#c0c8d3bb',
                border: '1px solid #556377',
                borderRadius: '8px',
                direction: 'rtl',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default CourseDistributionChart;
```

## Error Handling & Loading States

### Error Boundary Component

```tsx
// components/Dashboard/DashboardErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';
import { RefreshOutlined } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              خطأ في تحميل لوحة التحكم
            </Typography>
            <Typography variant="body2" gutterBottom>
              حدث خطأ غير متوقع أثناء تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى.
            </Typography>
            {this.state.error && (
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {this.state.error.message}
              </Typography>
            )}
          </Alert>
          <Button
            variant="contained"
            startIcon={<RefreshOutlined />}
            onClick={this.handleRetry}
          >
            إعادة تحميل الصفحة
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
```

### Loading Skeleton Component

```tsx
// components/Dashboard/DashboardSkeleton.tsx
import React from 'react';
import { Box, Grid, Card, CardContent, Skeleton } from '@mui/material';

const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" width={120} height={36} />
      </Box>

      {/* Stats Cards Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width={80} height={32} />
                  </Box>
                  <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 2 }} />
                </Box>
                <Skeleton variant="text" width={150} height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((index) => (
          <Grid item xs={12} lg={6} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardSkeleton;
```

## Data Refresh & Real-time Updates

### Refresh Button Component

```tsx
// components/Dashboard/RefreshButton.tsx
import React from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { RefreshOutlined } from '@mui/icons-material';

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  onClick, 
  loading = false, 
  disabled = false 
}) => {
  return (
    <Tooltip title="تحديث البيانات">
      <span>
        <IconButton 
          onClick={onClick} 
          disabled={disabled || loading}
          color="primary"
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <RefreshOutlined />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default RefreshButton;
```

### Auto-refresh Hook

```typescript
// hooks/useAutoRefresh.ts
import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number;
  enabled?: boolean;
  onRefresh: () => void;
}

export const useAutoRefresh = ({ 
  interval = 300000, // 5 minutes
  enabled = true,
  onRefresh 
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout>();

  const startAutoRefresh = useCallback(() => {
    if (!enabled) return;
    
    intervalRef.current = setInterval(onRefresh, interval);
  }, [enabled, interval, onRefresh]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return stopAutoRefresh;
  }, [enabled, startAutoRefresh, stopAutoRefresh]);

  // Stop on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else if (enabled) {
        startAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, startAutoRefresh, stopAutoRefresh]);

  return { startAutoRefresh, stopAutoRefresh };
};
```

## Usage Examples

### Basic Integration

```tsx
// pages/Dashboard.tsx
import React from 'react';
import DashboardErrorBoundary from '../components/Dashboard/DashboardErrorBoundary';
import Dashboard from '../components/Dashboard/Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <Dashboard />
    </DashboardErrorBoundary>
  );
};

export default DashboardPage;
```

### Custom Dashboard with Filters

```tsx
// components/CustomDashboard.tsx
import React, { useState } from 'react';
import { Box, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { useDashboard } from '../hooks/useDashboard';
import Dashboard from './Dashboard/Dashboard';

const CustomDashboard: React.FC = () => {
  const [months, setMonths] = useState(6);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, loading, error, refresh } = useDashboard({
    months,
    year,
    autoRefresh: true
  });

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>الأشهر</InputLabel>
          <Select
            value={months}
            onChange={(e) => setMonths(e.target.value as number)}
            label="الأشهر"
          >
            <MenuItem value={3}>3 أشهر</MenuItem>
            <MenuItem value={6}>6 أشهر</MenuItem>
            <MenuItem value={12}>12 شهر</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>السنة</InputLabel>
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value as number)}
            label="السنة"
          >
            <MenuItem value={2023}>2023</MenuItem>
            <MenuItem value={2024}>2024</MenuItem>
            <MenuItem value={2025}>2025</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Dashboard Content */}
      <Dashboard />
    </Box>
  );
};

export default CustomDashboard;
```

## Best Practices

### 1. Performance Optimization

```typescript
// utils/dashboardOptimization.ts
export class DashboardCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 300000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const dashboardCache = new DashboardCache();
```

### 2. Error Recovery

```typescript
// utils/errorRecovery.ts
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
};
```

### 3. Responsive Design

```typescript
// hooks/useResponsive.ts
import { useTheme, useMediaQuery } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return { isMobile, isTablet, isDesktop };
};
```

---

This comprehensive guide provides everything needed to integrate the dashboard API with your React frontend, including error handling, loading states, real-time updates, and responsive design considerations.