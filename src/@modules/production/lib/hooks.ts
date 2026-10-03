import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { TId } from '@base/interfaces';
import { IProductionFilter } from './interfaces';
import { ProductionServices } from './services';

export const ProductionHooks = {
  useFind: ({ options, config }: { options: IProductionFilter; config?: QueryConfig<typeof ProductionServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useQuery({
      queryKey: [...(queryKey ?? []), ProductionServices.NAME, options],
      queryFn: () => ProductionServices.find(options),
      ...rest,
    });
  },

  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof ProductionServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useQuery({
      queryKey: [...(queryKey ?? []), ProductionServices.NAME, id],
      queryFn: () => ProductionServices.findById(id),
      ...rest,
    });
  },

  useFindInfinite: ({ options, config }: { options: IProductionFilter; config?: InfiniteQueryConfig<typeof ProductionServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useInfiniteQuery({
      queryKey: [...(queryKey ?? []), ProductionServices.NAME, options],
      queryFn: ({ pageParam }) => ProductionServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;
        const fetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return fetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof ProductionServices.create> } = {}) =>
    useMutation({
      mutationFn: ProductionServices.create,
      onSettled: (data) => {
        if (data?.success) {
          queryClient.invalidateQueries({ queryKey: [ProductionServices.NAME] });
          queryClient.invalidateQueries({ queryKey: ['/products'] });
          queryClient.invalidateQueries({ queryKey: ['/raw-materials'] });
        }
      },
      ...config,
    }),

  useUpdate: ({ config }: { config?: MutationConfig<typeof ProductionServices.update> } = {}) =>
    useMutation({
      mutationFn: ProductionServices.update,
      onSettled: (data) => {
        if (data?.success) {
          queryClient.invalidateQueries({ queryKey: [ProductionServices.NAME] });
        }
      },
      ...config,
    }),

  useDelete: ({ config }: { config?: MutationConfig<typeof ProductionServices.delete> } = {}) =>
    useMutation({
      mutationFn: ProductionServices.delete,
      onSettled: (data) => {
        if (data?.success) {
          queryClient.invalidateQueries({ queryKey: [ProductionServices.NAME] });
        }
      },
      ...config,
    }),
};