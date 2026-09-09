import { IBaseResponse, IMetaResponse } from '@base/interfaces';
import { ENUM_PAYMENT_METHODS } from '@lib/constant';

export interface IProfitEntry {
  id: string;
  invoiceNo?: string;
  date: Date;
  revenue: number;
  totalCost: number;
  profit: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  customerId?: string;
  customerName?: string;
}

export interface IProfitFilter {
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: ENUM_PAYMENT_METHODS;
}

export interface IProfitStats {
  totalIncome: number;
  totalCostOfGoodsSold: number;
  totalSalesProfit: number;
  totalExpense: number;
  totalPurchase: number;
  netProfit: number;
}

export interface IProfitListResponse extends IBaseResponse<IProfitEntry[]> {
  meta: IMetaResponse;
}

export interface IProfitStatsResponse extends IBaseResponse<IProfitStats> {}
