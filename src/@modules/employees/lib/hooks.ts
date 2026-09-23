import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IEmployeesFilter } from './interfaces';
import { EmployeesServices } from './services';

export const EmployeesHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof EmployeesServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EmployeesServices.NAME, id],
      queryFn: () => EmployeesServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IEmployeesFilter; config?: QueryConfig<typeof EmployeesServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EmployeesServices.NAME, options],
      queryFn: () => EmployeesServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IEmployeesFilter;
    config?: InfiniteQueryConfig<typeof EmployeesServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), EmployeesServices.NAME, options],
      queryFn: ({ pageParam }) => EmployeesServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useBalance: ({
    id,
    config,
  }: {
    id: TId;
    config?: QueryConfig<typeof EmployeesServices.getBalance>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), EmployeesServices.NAME, id, 'balance'],
      queryFn: () => EmployeesServices.getBalance(id),
      enabled: !!id,
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof EmployeesServices.create> } = {}) => {
    return useMutation({
      mutationFn: EmployeesServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EmployeesServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof EmployeesServices.update> } = {}) => {
    return useMutation({
      mutationFn: EmployeesServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EmployeesServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof EmployeesServices.delete> } = {}) => {
    return useMutation({
      mutationFn: EmployeesServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [EmployeesServices.NAME] });
      },
      ...config,
    });
  },
};
