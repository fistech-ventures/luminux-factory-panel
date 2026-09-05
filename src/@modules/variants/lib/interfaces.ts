import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface IVariantsFilter extends IBaseFilter {}

export interface IVariantOption {
  id?: TId;
  title?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface IVariant extends IBaseEntity {
  title: string;
  options: IVariantOption[];
}

export interface IVariantsResponse extends IBaseResponse {
  data: IVariant[];
}

export interface IVariantCreate {
  title: string;
  isActive?: boolean;
  options?: IVariantOption[];
}