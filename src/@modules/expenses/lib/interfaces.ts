import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

export interface IExpensesFilter extends IBaseFilter {}

export interface IExpense extends IBaseEntity {
  date: string;
  purpose: string;
  amountSpent: number;
  spentBy: string;
}

export interface IExpensesResponse extends IBaseResponse {
  data: IExpense[];
}

export interface IExpenseCreate {
  date: string;
  purpose: string;
  amountSpent: number;
  spentBy: string;
}