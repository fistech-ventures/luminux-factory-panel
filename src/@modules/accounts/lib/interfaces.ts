import { IBaseResponse, IMetaResponse } from "@base/interfaces";
import { ENUM_PAYMENT_METHODS, ENUM_TRANSACTION_TYPES } from "@lib/constant";

export interface IAccountBalance {
  paymentMethod: ENUM_PAYMENT_METHODS;
  balance: number;
}

export interface IAccountBalancesResponse extends IBaseResponse {
  totalBalance: number;
  accounts: IAccountBalance[];
}

export interface IAccountTransaction {
  id: string;
  transactionDate: Date;
  transactionType: ENUM_TRANSACTION_TYPES;
  paymentMethod: ENUM_PAYMENT_METHODS;
  amount: number;
  referenceType: "sale" | "purchase" | "expense" | "payment";
  referenceId: string;
  description: string;
  entityType?: string;
  total: number;
}

export interface IAccountTransactionsFilter {
  accountType?: ENUM_PAYMENT_METHODS | string;
  transactionType?: ENUM_TRANSACTION_TYPES | string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface IAccountTransactionsData {
  data: IAccountTransaction[];
  total: number;
  totalCashIn: number;
  totalCashOut: number;
}

export interface IAccountTransactionsResponse extends IBaseResponse<IAccountTransactionsData> {
  meta: IMetaResponse;
}
