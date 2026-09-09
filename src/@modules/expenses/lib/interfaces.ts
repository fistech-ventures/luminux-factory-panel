import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse } from '@base/interfaces';
import { ENUM_PAYMENT_METHODS } from '@lib/constant';

export interface IExpensesFilter extends IBaseFilter {
  spentBy?: string;
  paymentMethod?: ENUM_PAYMENT_METHODS;
}

export interface IExpense extends IBaseEntity {
  date: string;
  purpose: string;
  amountSpent: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  spentBy: string;
}

export interface IExpensesResponse extends IBaseResponse {
  data: IExpense[];
  meta: IMetaResponse;
}

export interface IExpenseCreate {
  date: string;
  purpose: string;
  amountSpent: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  spentBy: string;
  createdBy?: string;
}