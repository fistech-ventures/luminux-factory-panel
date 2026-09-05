import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IPurchasesFilter } from './interfaces';
import { PurchasesServices } from './services';

export const PurchasesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof PurchasesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PurchasesServices.NAME, id],
      queryFn: () => PurchasesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IPurchasesFilter; config?: QueryConfig<typeof PurchasesServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), PurchasesServices.NAME, options],
      queryFn: () => PurchasesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IPurchasesFilter;
    config?: InfiniteQueryConfig<typeof PurchasesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), PurchasesServices.NAME, options],
      queryFn: ({ pageParam }) => PurchasesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof PurchasesServices.create> } = {}) => {
    return useMutation({
      mutationFn: PurchasesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PurchasesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof PurchasesServices.update> } = {}) => {
    return useMutation({
      mutationFn: PurchasesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PurchasesServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof PurchasesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: PurchasesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [PurchasesServices.NAME] });
      },
      ...config,
    });
  },
};