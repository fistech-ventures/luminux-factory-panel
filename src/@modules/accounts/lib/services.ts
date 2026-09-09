import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  IAccountBalancesResponse,
  IAccountTransactionsFilter,
  IAccountTransactionsResponse,
} from './interfaces';

const END_POINT: string = '/accounts';

export const AccountsServices = {
  NAME: END_POINT,

  getBalances: async (): Promise<IAccountBalancesResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/balances`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getTransactions: async (options: IAccountTransactionsFilter): Promise<IAccountTransactionsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/transactions?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
