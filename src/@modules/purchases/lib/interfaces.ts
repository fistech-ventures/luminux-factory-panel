import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface IPurchasesFilter extends IBaseFilter {
  supplierId?: TId;
}

export interface IPurchaseItem {
  productId?: TId;
  variantId?: TId;
  productName?: string;
  productCode?: string;
  quantity: number;
  totalProductCost: number;
  otherCost?: number;
}

export interface IPurchase extends IBaseEntity {
  purchaseDate: string;
  purchaseType: string;
  supplierId: TId;
  supplier?: {
    id: TId;
    companyName: string;
  };
  items: IPurchaseItem[];
  totalQuantity: number;
  totalPurchaseAmount: number;
  paidAmount: number;
  dueAmount: number;
  purchasedById: TId;
}

export interface IPurchasesResponse extends IBaseResponse {
  data: IPurchase[];
}

export interface IPurchaseCreate {
  purchaseDate: string;
  purchaseType: string;
  supplierId: TId;
  items: IPurchaseItem[];
  paidAmount: number;
  purchasedById: TId;
}