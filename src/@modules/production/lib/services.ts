import { IBaseResponse } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IProduction, IProductionCreate, IProductionFilter, IProductionResponse } from './interfaces';

const END_POINT = '/productions';

export const ProductionServices = {
  NAME: END_POINT,

  find: async (options: IProductionFilter): Promise<IProductionResponse> => {
    try {
      const response = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return response.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IProductionCreate): Promise<IBaseResponse<IProduction>> => {
    try {
      const response = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return response.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};