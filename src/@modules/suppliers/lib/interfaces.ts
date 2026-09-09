import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse } from '@base/interfaces';

export interface ISuppliersFilter extends IBaseFilter {}

export interface ISupplier extends IBaseEntity {
  companyName: string;
  contactPerson?: string;
  contactNumber: string;
  email?: string;
  address?: string;
}

export interface ISuppliersResponse extends IBaseResponse {
  data: ISupplier[];
  meta: IMetaResponse;
}

export interface ISupplierCreate {
  companyName: string;
  contactPerson?: string;
  contactNumber: string;
  email?: string;
  address?: string;
  createdBy?: string;
}