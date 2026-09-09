import { QueryConfig } from '@lib/config';
import { useQuery } from '@tanstack/react-query';
import { IAccountTransactionsFilter } from './interfaces';
import { AccountsServices } from './services';

export const AccountsHooks = {
  useGetBalances: ({ config }: { config?: QueryConfig<typeof AccountsServices.getBalances> } = {}) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), AccountsServices.NAME, 'balances'],
      queryFn: () => AccountsServices.getBalances(),
      ...rest,
    });
  },

  useGetTransactions: ({ options, config }: { options: IAccountTransactionsFilter; config?: QueryConfig<typeof AccountsServices.getTransactions> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), AccountsServices.NAME, 'transactions', options],
      queryFn: () => AccountsServices.getTransactions(options),
      ...rest,
    });
  },
};
