import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse, TId } from '@base/interfaces';
import { ENUM_PAYMENT_METHODS } from '@lib/constant';
import { IProductVariantLink, IProductVariantSku } from '@modules/products/lib/interfaces';

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
  unit?: string;
  variants?: IProductVariantLink[];
  skus?: IProductVariantSku[];
  combinations?: IPurchaseCombination[];
  quantity: number;
  totalProductCost: number;
  otherCost: number;
  totalCost?: number;
  product?: {
    id: TId;
    title: string;
    productCode: string;
    unit?: string;
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

export interface IPurchaseCombination {
  id?: TId;
  name: string;
  productCode: string;
  quantity: number;
  unit: string;
  totalProductCost: number;
  otherCost: number;
  sourcingPrice?: number;
  values: IProductVariantSku['values'];
}