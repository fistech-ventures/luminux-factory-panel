import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IVariantsFilter } from './interfaces';
import { VariantsServices } from './services';

export const VariantsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof VariantsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), VariantsServices.NAME, id],
      queryFn: () => VariantsServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IVariantsFilter; config?: QueryConfig<typeof VariantsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), VariantsServices.NAME, options],
      queryFn: () => VariantsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IVariantsFilter;
    config?: InfiniteQueryConfig<typeof VariantsServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), VariantsServices.NAME, options],
      queryFn: ({ pageParam }) => VariantsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof VariantsServices.create> } = {}) => {
    return useMutation({
      mutationFn: VariantsServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [VariantsServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof VariantsServices.update> } = {}) => {
    return useMutation({
      mutationFn: VariantsServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [VariantsServices.NAME] });
      },
      ...config,
    });
  },
};