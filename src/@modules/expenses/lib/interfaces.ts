import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse } from '@base/interfaces';
import { ENUM_PAYMENT_METHODS } from '@lib/constant';

export interface IExpensesFilter extends IBaseFilter {
  spentBy?: string;
  employeeId?: string;
  paymentMethod?: ENUM_PAYMENT_METHODS;
}

export interface IExpense extends IBaseEntity {
  date: string;
  purpose: string;
  amountSpent: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  /** Employee who spent the money out of their advance (uuid), when linked. */
  employeeId?: string;
  spentBy?: string;
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
  /** When set, the expense is settled from the employee's advance. */
  employeeId?: string;
  /** Auto-filled from the employee's name when employeeId is given. */
  spentBy?: string;
  createdBy?: string;
}