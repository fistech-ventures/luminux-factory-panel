import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse, TId } from '@base/interfaces';

export interface IProductionRawMaterial {
  rawMaterialId: TId;
  rawMaterialCombinationId?: TId;
  title: string;
  combinationTitle?: string;
  unit?: string;
  quantity: number;
  sourcingPrice: number;
  totalCost: number;
}

export interface INewProductionProduct {
  title: string;
  productCode: string;
  description?: string;
  warranty?: string;
  unit?: string;
  thumbnail?: string;
  sellingPrice?: number;
}

export interface IProductionCreate {
  productId?: TId;
  newProduct?: INewProductionProduct;
  quantity: number;
  otherCost?: number;
  usedRawMaterials: Array<{
    rawMaterialId: TId;
    rawMaterialCombinationId?: TId;
    quantity: number;
  }>;
}

export interface IProduction extends IBaseEntity {
  productId: TId;
  product?: { id: TId; title: string; productCode: string; unit?: string };
  quantity: number;
  otherCost: number;
  totalProductionCost: number;
  productionCostPerUnit: number;
  usedRawMaterials: IProductionRawMaterial[];
  isNewProduct: boolean;
}

export interface IProductionFilter extends IBaseFilter {}

export interface IProductionResponse extends IBaseResponse {
  data: IProduction[];
  meta: IMetaResponse;
}