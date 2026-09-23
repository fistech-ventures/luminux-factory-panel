import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  IInvestment,
  IInvestmentCreate,
  IInvestmentsFilter,
  IInvestmentsResponse,
} from './interfaces';

const END_POINT = '/investment';

export const InvestmentsServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IInvestment>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return res?.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IInvestmentsFilter): Promise<IInvestmentsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return res?.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IInvestmentCreate): Promise<IBaseResponse<IInvestment>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return res?.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IInvestmentCreate> }): Promise<IBaseResponse<IInvestment>> => {
    try {
      const res = await AxiosSecureInstance.patch(
        `${END_POINT}/${payload.id}`,
        Toolbox.toNullifyTraverse(payload.data),
      );
      return res?.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  delete: async (id: TId): Promise<IBaseResponse<null>> => {
    try {
      const res = await AxiosSecureInstance.delete(`${END_POINT}/${id}`);
      return res?.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
