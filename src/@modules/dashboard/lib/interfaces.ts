import { IBaseResponse } from "@base/interfaces";
import { ISale } from "@modules/sales/lib/interfaces";

export interface IDashboardStats {
  todaySales: {
    amount: number;
    count: number;
  };
  lifetimeSales: {
    amount: number;
    count: number;
  };
  todayPurchase: {
    amount: number;
    count: number;
  };
  todayExpense: {
    amount: number;
    count: number;
  };
  totalProducts: number;
  totalProductsValuation: number;
  recentSales: ISale[];
  salesChart: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  profitChart: Array<{
    date: string;
    profit: number;
  }>;
}

export interface IDashboardStatsFilter {
  days?: number;
  startDate?: string;
  endDate?: string;
  recentLimit?: number;
}

export interface IDashboardStatsResponse extends IBaseResponse<IDashboardStats> {}
