import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ISalesFilter } from './interfaces';
import { SalesServices } from './services';

export const SalesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof SalesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), SalesServices.NAME, id],
      queryFn: () => SalesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: ISalesFilter; config?: QueryConfig<typeof SalesServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), SalesServices.NAME, options],
      queryFn: () => SalesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: ISalesFilter;
    config?: InfiniteQueryConfig<typeof SalesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), SalesServices.NAME, options],
      queryFn: ({ pageParam }) => SalesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof SalesServices.create> } = {}) => {
    return useMutation({
      mutationFn: SalesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SalesServices.NAME] });
        queryClient.invalidateQueries({ queryKey: ['/products'] });
        queryClient.invalidateQueries({ queryKey: ['/raw-materials'] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof SalesServices.update> } = {}) => {
    return useMutation({
      mutationFn: SalesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SalesServices.NAME] });
        queryClient.invalidateQueries({ queryKey: ['/products'] });
        queryClient.invalidateQueries({ queryKey: ['/raw-materials'] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof SalesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: SalesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [SalesServices.NAME] });
        queryClient.invalidateQueries({ queryKey: ['/products'] });
        queryClient.invalidateQueries({ queryKey: ['/raw-materials'] });
      },
      ...config,
    });
  },
};