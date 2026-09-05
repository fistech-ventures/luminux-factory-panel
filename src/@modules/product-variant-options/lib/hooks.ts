import { TId } from '@base/interfaces';
import { MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IProductVariantOptionsFilter } from './interfaces';
import { ProductVariantOptionsServices } from './services';

export const ProductVariantOptionsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof ProductVariantOptionsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ProductVariantOptionsServices.NAME, id],
      queryFn: () => ProductVariantOptionsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({
    options,
    config,
  }: {
    options: IProductVariantOptionsFilter;
    config?: QueryConfig<typeof ProductVariantOptionsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ProductVariantOptionsServices.NAME, options],
      queryFn: () => ProductVariantOptionsServices.find(options),
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof ProductVariantOptionsServices.create> } = {}) => {
    return useMutation({
      mutationFn: ProductVariantOptionsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ProductVariantOptionsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof ProductVariantOptionsServices.update> } = {}) => {
    return useMutation({
      mutationFn: ProductVariantOptionsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ProductVariantOptionsServices.NAME] });
      },
      ...config,
    });
  },
};