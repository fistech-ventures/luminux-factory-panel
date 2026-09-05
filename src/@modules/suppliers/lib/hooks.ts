import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ISuppliersFilter } from './interfaces';
import { SuppliersServices } from './services';

export const SuppliersHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof SuppliersServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), SuppliersServices.NAME, id],
      queryFn: () => SuppliersServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: ISuppliersFilter; config?: QueryConfig<typeof SuppliersServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), SuppliersServices.NAME, options],
      queryFn: () => SuppliersServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: ISuppliersFilter;
    config?: InfiniteQueryConfig<typeof SuppliersServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), SuppliersServices.NAME, options],
      queryFn: ({ pageParam }) => SuppliersServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof SuppliersServices.create> } = {}) => {
    return useMutation({
      mutationFn: SuppliersServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SuppliersServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof SuppliersServices.update> } = {}) => {
    return useMutation({
      mutationFn: SuppliersServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SuppliersServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof SuppliersServices.delete> } = {}) => {
    return useMutation({
      mutationFn: SuppliersServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SuppliersServices.NAME] });
      },
      ...config,
    });
  },
};