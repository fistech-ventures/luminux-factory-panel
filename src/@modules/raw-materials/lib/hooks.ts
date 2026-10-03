import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { TId } from '@base/interfaces';
import { IRawMaterialsFilter } from './interfaces';
import { RawMaterialsServices } from './services';

export const RawMaterialsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof RawMaterialsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useQuery({
      queryKey: [...(queryKey ?? []), RawMaterialsServices.NAME, id],
      queryFn: () => RawMaterialsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IRawMaterialsFilter; config?: QueryConfig<typeof RawMaterialsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useQuery({
      queryKey: [...(queryKey ?? []), RawMaterialsServices.NAME, options],
      queryFn: () => RawMaterialsServices.find(options),
      ...rest,
    });
  },

  useInventory: ({ options, config }: { options: IRawMaterialsFilter; config?: QueryConfig<typeof RawMaterialsServices.findInventory> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useQuery({
      queryKey: [...(queryKey ?? []), RawMaterialsServices.NAME, 'inventory', options],
      queryFn: () => RawMaterialsServices.findInventory(options),
      ...rest,
    });
  },

  useFindInfinite: ({ options, config }: { options: IRawMaterialsFilter; config?: InfiniteQueryConfig<typeof RawMaterialsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useInfiniteQuery({
      queryKey: [...(queryKey ?? []), RawMaterialsServices.NAME, options],
      queryFn: ({ pageParam }) => RawMaterialsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;
        const fetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return fetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof RawMaterialsServices.create> } = {}) =>
    useMutation({
      mutationFn: RawMaterialsServices.create,
      onSettled: (data) => {
        if (data?.success) queryClient.invalidateQueries({ queryKey: [RawMaterialsServices.NAME] });
      },
      ...config,
    }),

  useUpdate: ({ config }: { config?: MutationConfig<typeof RawMaterialsServices.update> } = {}) =>
    useMutation({
      mutationFn: RawMaterialsServices.update,
      onSettled: (data) => {
        if (data?.success) queryClient.invalidateQueries({ queryKey: [RawMaterialsServices.NAME] });
      },
      ...config,
    }),

  useDelete: ({ config }: { config?: MutationConfig<typeof RawMaterialsServices.delete> } = {}) =>
    useMutation({
      mutationFn: RawMaterialsServices.delete,
      onSettled: (data) => {
        if (data?.success) queryClient.invalidateQueries({ queryKey: [RawMaterialsServices.NAME] });
      },
      ...config,
    }),
};