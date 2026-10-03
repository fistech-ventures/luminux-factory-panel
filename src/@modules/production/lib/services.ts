import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IProduction, IProductionCreate, IProductionFilter, IProductionResponse, IProductionUpdate } from './interfaces';

const END_POINT = '/productions';

export const ProductionServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IProduction>> => {
    try {
      const response = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return response.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

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

  update: async (payload: { id: TId; data: Partial<IProductionUpdate> }): Promise<IBaseResponse<IProduction>> => {
    try {
      const response = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, Toolbox.toNullifyTraverse(payload.data));
      return response.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  delete: async (id: TId): Promise<IBaseResponse<null>> => {
    try {
      const response = await AxiosSecureInstance.delete(`${END_POINT}/${id}`);
      return response.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};