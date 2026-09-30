import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse, TId } from '@base/interfaces';

export interface IInvestment extends IBaseEntity {
  date: string;
  title: string;
  investorId: TId;
  amount: number;
  investor?: {
    id: TId;
    name: string;
    employeeId: string;
  };
}

export interface IInvestmentsFilter extends IBaseFilter {
  investorId?: TId;
}

export interface IInvestmentsResponse extends IBaseResponse {
  data: IInvestment[];
  meta: IMetaResponse;
  total: {
    allInvestors: number;
    selectedInvestor: number;
  };
}

export interface IInvestmentCreate {
  date: string;
  title: string;
  investorId: TId;
  amount: number;
  createdBy?: TId;
}
