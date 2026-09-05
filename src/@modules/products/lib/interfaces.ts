import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface IProductsFilter extends IBaseFilter {
  stock?: number;
  sourcingPrice?: number;
  sellingPrice?: number;
  productCode?: string;
}

export interface IProductVariantLink {
  id?: TId;
  variantId: TId;
  variantOptionId: TId;
  sku?: string;
  sellingPrice?: number;
  stockQuantity?: number;
  position?: number;
  isDeleted?: boolean;
}

export interface IProductVariantRelation {
  variant?: {
    id: TId;
    title: string;
  };
  variantOption?: {
    id: TId;
    title: string;
  };
}

export interface IProduct extends IBaseEntity {
  title: string;
  description?: string;
  sourcingPrice: number;
  sellingPrice: number;
  thumbnail?: string;
  productCode: string;
  stock: number;
  saleQuantity: number;
  variants: (IProductVariantLink & IProductVariantRelation)[];
}

export interface IProductsResponse extends IBaseResponse {
  data: IProduct[];
}

export interface IProductCreate {
  title: string;
  description?: string;
  sourcingPrice?: number;
  sellingPrice?: number;
  thumbnail?: string;
  productCode: string;
  stock?: number;
  variants?: IProductVariantLink[];
}