import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

export interface ICustomersFilter extends IBaseFilter {}

export interface ICustomer extends IBaseEntity {
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
  companyName?: string;
}

export interface ICustomersResponse extends IBaseResponse {
  data: ICustomer[];
}

export interface ICustomerCreate {
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
  companyName?: string;
}