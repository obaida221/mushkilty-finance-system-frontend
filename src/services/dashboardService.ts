import { authService } from './authService';

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

class DashboardService {
  private baseURL = 'http://localhost:3001';

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    return await authService.authenticatedRequest(endpoint, options);
  }

  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    return await this.request('/dashboard/stats');
  }

  // Get revenue chart data
  async getRevenueChart(months = 6): Promise<RevenueChartData[]> {
    return await this.request(`/dashboard/revenue-chart?months=${months}`);
  }

  // Get student enrollment chart data  
  async getEnrollmentChart(months = 6): Promise<EnrollmentChartData[]> {
    return await this.request(`/dashboard/student-enrollment-chart?months=${months}`);
  }

  // Get course distribution data
  async getCourseDistribution(): Promise<CourseDistributionData[]> {
    return await this.request('/dashboard/course-distribution-chart');
  }

  // Get payment methods data
  async getPaymentMethods(months = 6): Promise<PaymentMethodData[]> {
    return await this.request(`/dashboard/payment-method-chart?months=${months}`);
  }

  // Get financial summary
  async getFinancialSummary(year?: number): Promise<FinancialSummary> {
    const yearParam = year ? `?year=${year}` : '';
    return await this.request(`/dashboard/financial-summary${yearParam}`);
  }

  // Get recent activities
  async getRecentActivities(limit = 10): Promise<RecentActivity[]> {
    return await this.request(`/dashboard/recent-activities?limit=${limit}`);
  }

  // Load all dashboard data at once
  async loadAllData(options: { months?: number; year?: number; activityLimit?: number } = {}): Promise<DashboardData> {
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
        this.getStats().catch(() => ({
          totalIncome: 0,
          totalExpenses: 0,
          activeStudents: 0,
          netProfit: 0,
          incomeChange: "0%",
          expensesChange: "0%",
          studentsChange: "0%",
          profitChange: "0%"
        })),
        this.getRevenueChart(months).catch(() => []),
        this.getEnrollmentChart(months).catch(() => []),
        this.getCourseDistribution().catch(() => []),
        this.getPaymentMethods(months).catch(() => []),
        this.getFinancialSummary(year).catch(() => ({
          year: new Date().getFullYear(),
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0,
          monthlyBreakdown: [],
          expenseCategories: []
        })),
        this.getRecentActivities(activityLimit).catch(() => [])
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
export default dashboardService;