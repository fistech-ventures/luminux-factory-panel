import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse, TId } from '@base/interfaces';
import { ENUM_PAYMENT_METHODS } from '@lib/constant';

export interface IPurchasesFilter extends IBaseFilter {
  supplierId?: TId;
  paymentMethod?: ENUM_PAYMENT_METHODS;
}

export interface IPurchaseItem {
  id?: TId;
  productId?: TId;
  variantId?: TId;
  skuId?: TId;
  productName?: string;
  productCode?: string;
  quantity: number;
  totalProductCost: number;
  otherCost: number;
  totalCost?: number;
  product?: {
    id: TId;
    title: string;
    productCode: string;
  };
}

export interface IPurchase extends IBaseEntity {
  purchaseDate: string;
  purchaseType: string;
  supplierId: TId;
  supplier?: {
    id: TId;
    companyName: string;
    contactPerson?: string;
    contactNumber: string;
    email?: string;
    address?: string;
  };
  items: IPurchaseItem[];
  totalQuantity: number;
  totalPurchaseAmount: number;
  paidAmount: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  dueAmount: number;
  purchasedById: TId;
  purchasedBy?: {
    id: TId;
    phoneNumber?: string;
  };
}

export interface IPurchasesResponse extends IBaseResponse {
  data: IPurchase[];
  meta: IMetaResponse;
}

export interface IPurchaseCreate {
  purchaseDate: string;
  purchaseType: string;
  supplierId: TId;
  items: IPurchaseItem[];
  paidAmount: number;
  paymentMethod: ENUM_PAYMENT_METHODS;
  purchasedById: TId;
  createdBy?: TId;
}