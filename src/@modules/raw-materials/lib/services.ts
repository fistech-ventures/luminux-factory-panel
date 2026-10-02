import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  IRawMaterial,
  IRawMaterialCreate,
  IRawMaterialsFilter,
  IRawMaterialsResponse,
} from './interfaces';

const END_POINT = '/raw-materials';

export const RawMaterialsServices = {
  NAME: END_POINT,

  find: async (options: IRawMaterialsFilter): Promise<IRawMaterialsResponse> => {
    try {
      const response = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return response.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IRawMaterialCreate): Promise<IBaseResponse<IRawMaterial>> => {
    try {
      const response = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return response.data;
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IRawMaterialCreate> }): Promise<IBaseResponse<IRawMaterial>> => {
    try {
      const response = await AxiosSecureInstance.patch(
        `${END_POINT}/${payload.id}`,
        Toolbox.toNullifyTraverse(payload.data),
      );
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