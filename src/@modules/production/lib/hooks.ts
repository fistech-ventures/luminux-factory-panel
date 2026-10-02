import { InfiniteQueryConfig, MutationConfig, queryClient } from '@lib/config';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { IProductionFilter } from './interfaces';
import { ProductionServices } from './services';

export const ProductionHooks = {
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
};