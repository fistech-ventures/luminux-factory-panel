import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface IProductVariantOptionsFilter extends IBaseFilter {
  variantId?: TId;
  productId?: TId;
}

export interface IProductVariantOption extends IBaseEntity {
  sku?: string;
  sellingPrice?: number;
  stockQuantity?: number;
  productId: TId;
  variantId: TId;
  variantOptionId: TId;
  position?: number;
  product?: {
    id: TId;
    title: string;
    productCode: string;
  };
  variant?: {
    id: TId;
    title: string;
  };
  variantOption?: {
    id: TId;
    title: string;
  };
}

export interface IProductVariantOptionsResponse extends IBaseResponse {
  data: IProductVariantOption[];
}

export interface IProductVariantOptionCreate {
  sku?: string;
  sellingPrice?: number;
  stockQuantity?: number;
  productId: TId;
  variantId: TId;
  variantOptionId: TId;
  position?: number;
}