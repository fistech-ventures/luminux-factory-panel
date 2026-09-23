import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IInvestmentsFilter } from './interfaces';
import { InvestmentsServices } from './services';

export const InvestmentsHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof InvestmentsServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useQuery({
      queryKey: [...(queryKey || []), InvestmentsServices.NAME, id],
      queryFn: () => InvestmentsServices.findById(id),
      enabled: !!id,
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IInvestmentsFilter; config?: QueryConfig<typeof InvestmentsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useQuery({
      queryKey: [...(queryKey || []), InvestmentsServices.NAME, options],
      queryFn: () => InvestmentsServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({ options, config }: { options: IInvestmentsFilter; config?: InfiniteQueryConfig<typeof InvestmentsServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};
    return useInfiniteQuery({
      queryKey: [...(queryKey || []), InvestmentsServices.NAME, options],
      queryFn: ({ pageParam }) => InvestmentsServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;
        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof InvestmentsServices.create> } = {}) =>
    useMutation({
      mutationFn: InvestmentsServices.create,
      onSettled: (data) => {
        if (data?.success) queryClient.invalidateQueries({ queryKey: [InvestmentsServices.NAME] });
      },
      ...config,
    }),

  useUpdate: ({ config }: { config?: MutationConfig<typeof InvestmentsServices.update> } = {}) =>
    useMutation({
      mutationFn: InvestmentsServices.update,
      onSettled: (data) => {
        if (data?.success) queryClient.invalidateQueries({ queryKey: [InvestmentsServices.NAME] });
      },
      ...config,
    }),

  useDelete: ({ config }: { config?: MutationConfig<typeof InvestmentsServices.delete> } = {}) =>
    useMutation({
      mutationFn: InvestmentsServices.delete,
      onSettled: (data) => {
        if (data?.success) queryClient.invalidateQueries({ queryKey: [InvestmentsServices.NAME] });
      },
      ...config,
    }),
};
