import { IBaseResponse, IMetaResponse } from '@base/interfaces';
import { ENUM_PAYMENT_METHODS } from '@lib/constant';

export interface ILossEntry {
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

export interface ILossFilter {
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: ENUM_PAYMENT_METHODS;
}

export interface ILossStats {
  totalLoss: number;
  totalLossCount: number;
}

export interface ILossListResponse extends IBaseResponse<ILossEntry[]> {
  meta: IMetaResponse;
}

export interface ILossStatsResponse extends IBaseResponse<ILossStats> {}
