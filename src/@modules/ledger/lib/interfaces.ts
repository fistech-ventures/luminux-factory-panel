import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface ILedgerFilter extends IBaseFilter {
  entityType?: 'customer' | 'supplier';
  entityId?: TId;
  type?: string;
}

export interface ILedger extends IBaseEntity {
  entityType: 'customer' | 'supplier';
  entityId: TId;
  type: string;
  amount: number;
  referenceId?: TId;
  referenceType?: string;
  description?: string;
  transactionDate: string;
}

export interface ILedgerResponse extends IBaseResponse {
  data: ILedger[];
}

export interface ILedgerCreate {
  entityType: 'customer' | 'supplier';
  entityId: TId;
  type: string;
  amount: number;
  referenceId?: TId;
  referenceType?: string;
  description?: string;
  transactionDate: string;
}

export interface IBalance {
  totalDue: number;
  totalPaid: number;
  balance: number;
}