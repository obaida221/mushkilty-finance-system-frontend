import { authService } from './authService';

export interface DashboardStats {
  totalIncomeIQD: number;
  totalIncomeUSD: number;
  refundsIQD: number;
  refundsUSD: number;
  totalExpensesIQD: number;
  totalExpensesUSD: number;
  activeStudents: number;
  netProfitIQD: number;
  netProfitUSD: number;
  incomeChangeIQD: string;
  incomeChangeUSD: string;
  expensesChangeIQD: string;
  expensesChangeUSD: string;
  studentsChange: string;
  profitChangeIQD: string;
  profitChangeUSD: string;
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

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await authService.authenticatedRequest(endpoint, options);
    return response;
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
      // Get expenses data
      const expensesResponse = await this.request('/expenses');
      // console.log('Expenses Response:', expensesResponse);
      const expensesData = Array.isArray(expensesResponse) ? expensesResponse : (expensesResponse?.data || []);
      // console.log('Expenses Data:', expensesData);
      const expensesByCurrency = expensesData.reduce((acc: {IQD: number, USD: number}, expense: any) => {
        if (expense?.currency === 'USD') {
          acc.USD += Number(expense?.amount) || 0;
        } else {
          acc.IQD += Number(expense?.amount) || 0;
        }
        return acc;
      }, {IQD: 0, USD: 0}) || {IQD: 0, USD: 0};

      // Get income data
      const incomeResponse = await this.request('/payments');
      // console.log('Income Response:', incomeResponse);
      const incomeData = Array.isArray(incomeResponse) ? incomeResponse : (incomeResponse?.data || []);
      // console.log('Income Data:', incomeData);

      // // Get refunds data
      // const refundsResponse = await this.request('/refunds');
      // const refundsData = Array.isArray(refundsResponse) ? refundsResponse : (refundsResponse?.data || []);

      // Calculate income excluding refunds and incomplete payments
      const { incomeByCurrency, refundsByCurrency } = incomeData.reduce((acc: {
        incomeByCurrency: {IQD: number, USD: number},
        refundsByCurrency: {IQD: number, USD: number}
      }, payment: any) => {
        if (payment?.status === 'REFUNDED') {
          if (payment?.currency === 'USD') {
            acc.refundsByCurrency.USD += Number(payment?.amount) || 0;
          } else {
            acc.refundsByCurrency.IQD += Number(payment?.amount) || 0;
          }
        } else if (payment?.status === 'completed') {
          if (payment?.currency === 'USD') {
            acc.incomeByCurrency.USD += Number(payment?.amount) || 0;
          } else {
            acc.incomeByCurrency.IQD += Number(payment?.amount) || 0;
          }
        }
        return acc;
      }, {
        incomeByCurrency: {IQD: 0, USD: 0},
        refundsByCurrency: {IQD: 0, USD: 0}
      });

      // Calculate profits by currency
      // console.log('Income by Currency:', incomeByCurrency);
      // console.log('Expenses by Currency:', expensesByCurrency);
      const netProfitIQD = incomeByCurrency.IQD - expensesByCurrency.IQD;
      const netProfitUSD = incomeByCurrency.USD - expensesByCurrency.USD;
      // console.log('Net Profit IQD:', netProfitIQD);
      // console.log('Net Profit USD:', netProfitUSD);

      // Calculate active students based on all accepted enrollments in the current year
      let activeStudentsCount = 0;
      try {
        // Get current year dynamically - will update automatically each year
        const currentYear = new Date().getFullYear();
        // console.log(`Calculating active students for year: ${currentYear}`);

        // Fetch all enrollments data
        const enrollmentsResponse = await this.request('/enrollments');
        const enrollmentsData = Array.isArray(enrollmentsResponse) ? enrollmentsResponse : (enrollmentsResponse?.data || []);
        // console.log(`Total enrollments fetched: ${enrollmentsData.length}`);
        // console.log('Sample enrollment data:', enrollmentsData.slice(0, 3));

        // Create a Set to store unique student IDs with accepted enrollments in current year
        const activeStudentIds = new Set();

        // Process all enrollments to find accepted ones in the current year
        enrollmentsData.forEach((enrollment: any) => {
          // Check if enrollment status is accepted (case insensitive)
          if (enrollment.status && enrollment.status.toLowerCase() === 'accepted') {
            // Try to get enrollment date from multiple possible fields
            const enrollmentDate = new Date(
              enrollment.enrolled_at ||
              enrollment.created_at ||
              enrollment.date ||
              enrollment.updated_at
            );

            // Check if the enrollment date is valid and in the current year
            if (!isNaN(enrollmentDate.getTime()) && enrollmentDate.getFullYear() === currentYear) {
              // Add student ID to the set if it exists
              if (enrollment.studentId || enrollment.student_id || enrollment.student || enrollment.id) {
                const studentId = enrollment.studentId || enrollment.student_id || enrollment.student || enrollment.id;
                activeStudentIds.add(studentId);
                // console.log(`Added student ${studentId} to active students list`);
              }
            }
          }
        });

        // Count unique active students
        activeStudentsCount = activeStudentIds.size;
        // console.log(`Active students in ${currentYear}:`, activeStudentsCount);
        // console.log('Active student IDs:', Array.from(activeStudentIds));
      } catch (error) {
        // console.error('Failed to fetch enrollments data:', error);
        // Keep activeStudentsCount as 0 if there's an error
      }

      // Calculate percentage changes
      const calculatePercentageChange = (current: number, previous: number): string => {
        if (previous === 0) return current > 0 ? "+100%" : "0%";
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
      };

      // Get previous period data for comparison
      let previousIncomeIQD = 0, previousIncomeUSD = 0;
      let previousExpensesIQD = 0, previousExpensesUSD = 0;
      let previousActiveStudents = 0;

      try {
        // Get previous month data (this assumes the API supports date range queries)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStr = lastMonth.toISOString().slice(0, 7); // Format: YYYY-MM

        // Previous income
        const previousIncomeResponse = await this.request(`/payments?month=${lastMonthStr}`);
        const previousIncomeData = Array.isArray(previousIncomeResponse) ? previousIncomeResponse : (previousIncomeResponse?.data || []);

        previousIncomeData.forEach((payment: any) => {
          if (payment.status === 'completed') {
            if (payment.currency === 'USD') {
              previousIncomeUSD += Number(payment.amount) || 0;
            } else {
              previousIncomeIQD += Number(payment.amount) || 0;
            }
          }
        });

        // Previous expenses
        const previousExpensesResponse = await this.request(`/expenses?month=${lastMonthStr}`);
        const previousExpensesData = Array.isArray(previousExpensesResponse) ? previousExpensesResponse : (previousExpensesResponse?.data || []);

        previousExpensesData.forEach((expense: any) => {
          if (expense.currency === 'USD') {
            previousExpensesUSD += Number(expense.amount) || 0;
          } else {
            previousExpensesIQD += Number(expense.amount) || 0;
          }
        });

        // Previous active students
        const previousStudentsResponse = await this.request(`/students?month=${lastMonthStr}`);
        const previousStudentsData = Array.isArray(previousStudentsResponse) ? previousStudentsResponse : (previousStudentsResponse?.data || []);
        previousActiveStudents = previousStudentsData.filter((student: any) => {
          return student.status === 'active' ||
                 student.isActive === true ||
                 (student.enrollments && student.enrollments.some((e: any) => e.status === 'active'));
        }).length;
      } catch (error) {
        // console.error('Failed to fetch previous period data:', error);
      }

      const stats = {
        totalIncomeIQD: incomeByCurrency.IQD,
        totalIncomeUSD: incomeByCurrency.USD,
        refundsIQD: refundsByCurrency.IQD,
        refundsUSD: refundsByCurrency.USD,
        totalExpensesIQD: expensesByCurrency.IQD,
        totalExpensesUSD: expensesByCurrency.USD,
        activeStudents: activeStudentsCount,
        netProfitIQD,
        netProfitUSD,
        incomeChangeIQD: calculatePercentageChange(incomeByCurrency.IQD, previousIncomeIQD),
        incomeChangeUSD: calculatePercentageChange(incomeByCurrency.USD, previousIncomeUSD),
        expensesChangeIQD: calculatePercentageChange(expensesByCurrency.IQD, previousExpensesIQD),
        expensesChangeUSD: calculatePercentageChange(expensesByCurrency.USD, previousExpensesUSD),
        studentsChange: calculatePercentageChange(activeStudentsCount, previousActiveStudents),
        profitChangeIQD: calculatePercentageChange(netProfitIQD, (previousIncomeIQD - previousExpensesIQD)),
        profitChangeUSD: calculatePercentageChange(netProfitUSD, (previousIncomeUSD - previousExpensesUSD))
      };

      // console.log('Final Stats:', stats);

      const [
        revenueChart,
        enrollmentChart,
        courseDistribution,
        paymentMethods,
        financialSummary,
        recentActivities
      ] = await Promise.all([
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
      // console.error('Failed to load dashboard data:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
