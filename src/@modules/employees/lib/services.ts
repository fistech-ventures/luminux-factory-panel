import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  IEmployee,
  IEmployeeBalance,
  IEmployeeCreate,
  IEmployeesFilter,
  IEmployeesResponse,
} from './interfaces';

const END_POINT: string = '/employee';

export const EmployeesServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IEmployee>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IEmployeesFilter): Promise<IEmployeesResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IEmployeeCreate): Promise<IBaseResponse<IEmployee>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IEmployeeCreate> }): Promise<IBaseResponse<IEmployee>> => {
    try {
      const res = await AxiosSecureInstance.patch(
        `${END_POINT}/${payload.id}`,
        Toolbox.toNullifyTraverse(payload.data),
      );
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

  /** Cash in hand, derived from the employee's ledger (advances - expenses). */
  getBalance: async (id: TId): Promise<IBaseResponse<IEmployeeBalance>> => {
    try {
      const res = await AxiosSecureInstance.get(`/ledger/employee/${id}/balance`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
