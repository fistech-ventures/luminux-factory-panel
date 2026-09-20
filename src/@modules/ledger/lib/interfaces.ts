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

export interface ILedgerStatementRow {
  date: string;
  particulars: string | null;
  narration: string;
  invoiceNo: string | null;
  qty: number | null;
  gross: number | null;
  debit: number;
  credit: number;
  balance: number;
}

export interface ILedgerStatement {
  party: {
    id: string;
    name: string;
    contactNumber: string | null;
    companyName: string | null;
    address: string | null;
    customerType?: 'B2B' | 'B2C';
  };
  startDate: string | null;
  endDate: string | null;
  openingBalance: number;
  closingBalance: number;
  totals: {
    grossTotal: number;
    debitTotal: number;
    creditTotal: number;
  };
  rows: ILedgerStatementRow[];
}

export interface ILedgerStatementOptions {
  entityType: 'customer' | 'supplier';
  entityId: TId;
  startDate?: string;
  endDate?: string;
}