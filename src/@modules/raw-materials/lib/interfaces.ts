import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse, TId } from '@base/interfaces';

export interface IRawMaterialsFilter extends IBaseFilter {}

export interface IRawMaterialCombination {
  id?: TId;
  title: string;
  code?: string;
  unit?: string;
  sourcingPrice: number;
  sellingPrice: number;
  stock: number;
  saleQuantity?: number;
}

export interface IRawMaterial extends IBaseEntity {
  title: string;
  description?: string;
  unit?: string;
  warranty?: string;
  sourcingPrice: number;
  sellingPrice: number;
  image?: string;
  stock: number;
  saleQuantity: number;
  combinations: IRawMaterialCombination[];
}

export interface IRawMaterialsResponse extends IBaseResponse {
  data: IRawMaterial[];
  meta: IMetaResponse;
}

export interface IRawMaterialCreate {
  title: string;
  description?: string;
  unit?: string;
  warranty?: string;
  sourcingPrice?: number;
  sellingPrice?: number;
  image?: string;
  stock?: number;
  combinations?: IRawMaterialCombination[];
  createdBy?: TId;
}