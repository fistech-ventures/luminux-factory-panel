import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { ILossFilter, ILossListResponse, ILossStatsResponse } from './interfaces';

const END_POINT: string = '/loss';

export const LossServices = {
  NAME: END_POINT,

  getLossList: async (options: ILossFilter): Promise<ILossListResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getLossStats: async (options: ILossFilter): Promise<ILossStatsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/stats?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
