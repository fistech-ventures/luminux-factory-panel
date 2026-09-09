import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse } from '@base/interfaces';
import { ENUM_PAYMENT_METHODS } from '@lib/constant';

export interface IPayment extends IBaseEntity {
  amount: number;
  entityType: string;
  entityId: string;
  paymentMethod: ENUM_PAYMENT_METHODS;
  paymentDate: Date;
  referenceId?: string;
  referenceType?: string;
  note?: string;
}

export interface IPaymentCreate {
  amount: number;
  entityType: string;
  entityId: string;
  paymentMethod: ENUM_PAYMENT_METHODS;
  paymentDate: Date;
  referenceId?: string;
  referenceType?: string;
  note?: string;
}

export interface IPaymentFilter extends IBaseFilter {
  entityType?: string;
  entityId?: string;
  paymentMethod?: ENUM_PAYMENT_METHODS;
}

export interface IPaymentsResponse extends IBaseResponse<IPayment[]> {
  meta: IMetaResponse;
}
