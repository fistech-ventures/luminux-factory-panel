import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface ISalesFilter extends IBaseFilter {
  customerId?: TId;
  soldById?: TId;
  paymentMethod?: string;
}

export interface ISaleItem {
  productId: TId;
  variantId?: TId;
  quantity: number;
  sellingPrice: number;
  totalAmount?: number;
}

export interface ISale extends IBaseEntity {
  date: string;
  invoiceNo: string;
  invoiceUrl?: string;
  customerId: TId;
  customer?: {
    id: TId;
    name: string;
    contactNumber?: string;
  };
  items: ISaleItem[];
  totalAmount: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentMethod: string;
  dueAmount: number;
  soldById: TId;
}

export interface ISalesResponse extends IBaseResponse {
  data: ISale[];
}

export interface ISaleCreate {
  date: string;
  customerId: TId;
  items: ISaleItem[];
  discount: number;
  paidAmount: number;
  paymentMethod: string;
  soldById: TId;
}