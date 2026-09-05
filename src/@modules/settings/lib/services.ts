import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn } from '@lib/utils';
import { AxiosRequestConfig } from 'axios';
import { ISettingsCreate, ISettingsResponse } from './interfaces';

const END_POINT: string = '/global-configs/system';

export const SettingsServices = {
  NAME: END_POINT,

  find: async (config?: AxiosRequestConfig): Promise<ISettingsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(END_POINT, config);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findQuick: async (config?: AxiosRequestConfig): Promise<ISettingsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(END_POINT, config);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: Partial<ISettingsCreate>): Promise<ISettingsResponse> => {
    try {
      const res = await AxiosSecureInstance.patch(END_POINT, payload);

      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
