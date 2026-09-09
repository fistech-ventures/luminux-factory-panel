import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IPaymentFilter } from './interfaces';
import { PaymentsServices } from './services';

export const PaymentsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof PaymentsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PaymentsServices.NAME, id],
      queryFn: () => PaymentsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IPaymentFilter; config?: QueryConfig<typeof PaymentsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PaymentsServices.NAME, options],
      queryFn: () => PaymentsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IPaymentFilter;
    config?: InfiniteQueryConfig<typeof PaymentsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), PaymentsServices.NAME, options],
      queryFn: ({ pageParam }) => PaymentsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof PaymentsServices.create> } = {}) => {
    return useMutation({
      mutationFn: PaymentsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PaymentsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof PaymentsServices.update> } = {}) => {
    return useMutation({
      mutationFn: PaymentsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PaymentsServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof PaymentsServices.delete> } = {}) => {
    return useMutation({
      mutationFn: PaymentsServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PaymentsServices.NAME] });
      },
      ...config,
    });
  },
};
