import {
  IBaseEntity,
  IBaseFilter,
  IBaseResponse,
  IMetaResponse,
  TId,
} from "@base/interfaces";
import { ENUM_PAYMENT_METHODS } from "@lib/constant";

export interface ISalesFilter extends IBaseFilter {
  customerId?: TId;
  soldById?: TId;
  paymentMethod?: ENUM_PAYMENT_METHODS;
}

export interface ISaleItem {
  id?: TId;
  productId: TId;
  variantId?: TId;
  skuId?: TId;
  quantity: number;
  sellingPrice: number;
  sourcingPrice?: number;
  totalAmount?: number;
  totalPrice?: number;
  product?: {
    id: TId;
    title: string;
    productCode: string;
    sellingPrice: number;
    stock: number;
    unit?: string;
  };
  variant?: {
    id: TId;
    title: string;
    variant?: { title: string };
    variantOption?: { title: string };
  };
  sku?: {
    id: TId;
    name?: string;
    productCode: string;
    unit?: string;
    values?: Array<{
      variant?: { title: string };
      variantOption?: { title: string };
    }>;
  };
}

export interface ISale extends IBaseEntity {
  date: string;
  invoiceNo?: string;
  invoiceUrl?: string;
  customerId: TId;
  customer?: {
    id: TId;
    name: string;
    customerType?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    companyName?: string;
  };
  shippingTo?: string;
  shippingAddress?: string;
  shippingContact?: string;
  items: ISaleItem[];
  totalAmount: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  dueAmount: number;
  soldById: TId;
  soldBy?: {
    id: TId;
    phoneNumber?: string;
    fullName?: string;
  };
}

export interface ISalesResponse extends IBaseResponse {
  data: ISale[];
  meta: IMetaResponse;
}

export interface ISaleCreate {
  date: string;
  customerId: TId;
  items: ISaleItem[];
  discount: number;
  paidAmount: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  soldById: TId;
  createdBy?: TId;
}
