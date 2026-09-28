import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export type TLedgerEntityType = 'customer' | 'supplier' | 'employee';

export interface ILedgerFilter extends IBaseFilter {
  entityType?: TLedgerEntityType;
  entityId?: TId;
  type?: string;
}

export interface ILedger extends IBaseEntity {
  entityType: TLedgerEntityType;
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
  entityType: TLedgerEntityType;
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

export interface ILedgerBalanceSummary {
  customerDue: number;
  supplierDue: number;
}

/** Cash in hand for an employee: advances received - money spent. */
export interface IEmployeeBalance {
  totalAdvance: number;
  totalExpense: number;
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
    // Employee-specific fields (present when entityType is 'employee')
    employeeId?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    designation?: string | null;
    // Customer/supplier fields (present for those entity types)
    contactNumber?: string | null;
    companyName?: string | null;
    address?: string | null;
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
  entityType: TLedgerEntityType;
  entityId: TId;
  startDate?: string;
  endDate?: string;
}