import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IProductsFilter } from './interfaces';
import { ProductsServices } from './services';

export const ProductsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof ProductsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ProductsServices.NAME, id],
      queryFn: () => ProductsServices.findById(id),
      ...rest,
    });
  },

  useFindByCode: ({ productCode, config }: { productCode: string; config?: QueryConfig<typeof ProductsServices.findByCode> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ProductsServices.NAME, 'by-code', productCode],
      queryFn: () => ProductsServices.findByCode(productCode),
      enabled: !!productCode,
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IProductsFilter; config?: QueryConfig<typeof ProductsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ProductsServices.NAME, options],
      queryFn: () => ProductsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IProductsFilter;
    config?: InfiniteQueryConfig<typeof ProductsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), ProductsServices.NAME, options],
      queryFn: ({ pageParam }) => ProductsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof ProductsServices.create> } = {}) => {
    return useMutation({
      mutationFn: ProductsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ProductsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof ProductsServices.update> } = {}) => {
    return useMutation({
      mutationFn: ProductsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ProductsServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof ProductsServices.delete> } = {}) => {
    return useMutation({
      mutationFn: ProductsServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ProductsServices.NAME] });
      },
      ...config,
    });
  },
};