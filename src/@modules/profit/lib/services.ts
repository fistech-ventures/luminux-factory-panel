import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IProfitFilter, IProfitListResponse, IProfitStatsResponse } from './interfaces';

const END_POINT: string = '/internal/profit';

export const ProfitServices = {
  NAME: END_POINT,

  getProfitList: async (options: IProfitFilter): Promise<IProfitListResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getProfitStats: async (options: IProfitFilter): Promise<IProfitStatsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/stats?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
