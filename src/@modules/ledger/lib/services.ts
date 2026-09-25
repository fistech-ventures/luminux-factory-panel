import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  IBalance,
  ILedgerBalanceSummary,
  IEmployeeBalance,
  ILedger,
  ILedgerCreate,
  ILedgerFilter,
  ILedgerResponse,
  ILedgerStatement,
  ILedgerStatementOptions,
} from './interfaces';

const END_POINT: string = '/ledger';

export const LedgerServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<ILedger>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: ILedgerFilter): Promise<ILedgerResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findFiltered: async (options: ILedgerFilter): Promise<ILedgerResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/filter?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getCustomerBalance: async (customerId: TId): Promise<IBaseResponse<IBalance>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/customer/${customerId}/balance`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getSupplierBalance: async (supplierId: TId): Promise<IBaseResponse<IBalance>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/supplier/${supplierId}/balance`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getEmployeeBalance: async (employeeId: TId): Promise<IBaseResponse<IEmployeeBalance>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/employee/${employeeId}/balance`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getBalanceSummary: async (): Promise<IBaseResponse<ILedgerBalanceSummary>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/balance-summary`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getStatement: async (options: ILedgerStatementOptions): Promise<IBaseResponse<ILedgerStatement>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/statement?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: ILedgerCreate): Promise<IBaseResponse<ILedger>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<ILedgerCreate> }): Promise<IBaseResponse<ILedger>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, Toolbox.toNullifyTraverse(payload.data));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  delete: async (id: TId): Promise<IBaseResponse<null>> => {
    try {
      const res = await AxiosSecureInstance.delete(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};