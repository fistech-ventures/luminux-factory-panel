import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse } from '@base/interfaces';
import { ENUM_CUSTOMER_TYPES } from '@lib/constant';

export interface ICustomersFilter extends IBaseFilter {
  customerType?: ENUM_CUSTOMER_TYPES;
}

export interface ICustomer extends IBaseEntity {
  name: string;
  customerType: ENUM_CUSTOMER_TYPES;
  contactNumber: string;
  email?: string;
  address?: string;
  companyName?: string;
}

export interface ICustomersResponse extends IBaseResponse {
  data: ICustomer[];
  meta: IMetaResponse;
}

export interface ICustomerCreate {
  name: string;
  customerType: ENUM_CUSTOMER_TYPES;
  contactNumber: string;
  email?: string;
  address?: string;
  companyName?: string;
  createdBy?: string;
}