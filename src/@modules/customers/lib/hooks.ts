import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ICustomersFilter } from './interfaces';
import { CustomersServices } from './services';

export const CustomersHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof CustomersServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), CustomersServices.NAME, id],
      queryFn: () => CustomersServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: ICustomersFilter; config?: QueryConfig<typeof CustomersServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), CustomersServices.NAME, options],
      queryFn: () => CustomersServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: ICustomersFilter;
    config?: InfiniteQueryConfig<typeof CustomersServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), CustomersServices.NAME, options],
      queryFn: ({ pageParam }) => CustomersServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof CustomersServices.create> } = {}) => {
    return useMutation({
      mutationFn: CustomersServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [CustomersServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof CustomersServices.update> } = {}) => {
    return useMutation({
      mutationFn: CustomersServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [CustomersServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof CustomersServices.delete> } = {}) => {
    return useMutation({
      mutationFn: CustomersServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [CustomersServices.NAME] });
      },
      ...config,
    });
  },
};