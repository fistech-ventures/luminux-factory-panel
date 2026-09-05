import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IExpensesFilter } from './interfaces';
import { ExpensesServices } from './services';

export const ExpensesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof ExpensesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ExpensesServices.NAME, id],
      queryFn: () => ExpensesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IExpensesFilter; config?: QueryConfig<typeof ExpensesServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ExpensesServices.NAME, options],
      queryFn: () => ExpensesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IExpensesFilter;
    config?: InfiniteQueryConfig<typeof ExpensesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), ExpensesServices.NAME, options],
      queryFn: ({ pageParam }) => ExpensesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof ExpensesServices.create> } = {}) => {
    return useMutation({
      mutationFn: ExpensesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ExpensesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof ExpensesServices.update> } = {}) => {
    return useMutation({
      mutationFn: ExpensesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ExpensesServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof ExpensesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: ExpensesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [ExpensesServices.NAME] });
      },
      ...config,
    });
  },
};