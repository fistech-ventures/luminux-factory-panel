import {
  IBaseEntity,
  IBaseFilter,
  IBaseResponse,
  IMetaResponse,
  TId,
} from "@base/interfaces";

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

export interface IProductVariantSkuValue {
  id?: TId;
  variantId: TId;
  variantOptionId: TId;
  variant?: { id: TId; title: string };
  variantOption?: { id: TId; title: string };
}

export interface IProductVariantSku {
  id?: TId;
  productCode: string;
  sourcingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  saleQuantity?: number;
  values: IProductVariantSkuValue[];
}

export interface IProduct extends IBaseEntity {
  title: string;
  description?: string;
  sourcingPrice: number;
  sellingPrice: number;
  thumbnail?: string;
  productCode: string;
  unit?: string;
  stock: number;
  saleQuantity: number;
  averageB2BSalesPrice: number;
  averageB2CSalesPrice: number;
  b2bSoldQuantity: number;
  b2cSoldQuantity: number;
  variants: (IProductVariantLink & IProductVariantRelation)[];
  skus: IProductVariantSku[];
}

export interface IProductsResponse extends IBaseResponse {
  data: IProduct[];
  meta: IMetaResponse;
}

export interface IProductCreate {
  title: string;
  description?: string;
  sourcingPrice?: number;
  sellingPrice?: number;
  thumbnail?: string;
  productCode: string;
  unit?: string;
  stock?: number;
  variants?: IProductVariantLink[];
  skus?: IProductVariantSku[];
  createdBy?: TId;
}
