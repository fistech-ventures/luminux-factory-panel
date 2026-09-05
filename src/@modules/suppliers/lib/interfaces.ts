import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

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
}

export interface ISupplierCreate {
  companyName: string;
  contactPerson?: string;
  contactNumber: string;
  email?: string;
  address?: string;
}