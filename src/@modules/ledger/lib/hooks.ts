import { TId } from '@base/interfaces';
import { MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ILedgerFilter } from './interfaces';
import { LedgerServices } from './services';

export const LedgerHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof LedgerServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LedgerServices.NAME, id],
      queryFn: () => LedgerServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: ILedgerFilter; config?: QueryConfig<typeof LedgerServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LedgerServices.NAME, options],
      queryFn: () => LedgerServices.find(options),
      ...rest,
    });
  },

  useFindFiltered: ({ options, config }: { options: ILedgerFilter; config?: QueryConfig<typeof LedgerServices.findFiltered> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LedgerServices.NAME, 'filter', options],
      queryFn: () => LedgerServices.findFiltered(options),
      ...rest,
    });
  },

  useGetCustomerBalance: ({
    customerId,
    config,
  }: {
    customerId: TId;
    config?: QueryConfig<typeof LedgerServices.getCustomerBalance>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LedgerServices.NAME, 'customer', customerId, 'balance'],
      queryFn: () => LedgerServices.getCustomerBalance(customerId),
      enabled: !!customerId,
      ...rest,
    });
  },

  useGetSupplierBalance: ({
    supplierId,
    config,
  }: {
    supplierId: TId;
    config?: QueryConfig<typeof LedgerServices.getSupplierBalance>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LedgerServices.NAME, 'supplier', supplierId, 'balance'],
      queryFn: () => LedgerServices.getSupplierBalance(supplierId),
      enabled: !!supplierId,
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof LedgerServices.create> } = {}) => {
    return useMutation({
      mutationFn: LedgerServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [LedgerServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof LedgerServices.update> } = {}) => {
    return useMutation({
      mutationFn: LedgerServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [LedgerServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof LedgerServices.delete> } = {}) => {
    return useMutation({
      mutationFn: LedgerServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [LedgerServices.NAME] });
      },
      ...config,
    });
  },
};