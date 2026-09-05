import { TId } from '@base/interfaces';
import { InfiniteQueryConfig, MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IUsersFilter } from './interfaces';
import { UsersServices } from './services';

export const UsersHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof UsersServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), UsersServices.NAME, id],
      queryFn: () => UsersServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IUsersFilter; config?: QueryConfig<typeof UsersServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), UsersServices.NAME, options],
      queryFn: () => UsersServices.find(options),
      ...rest,
    });
  },

  useFindInfinite: ({
    options,
    config,
  }: {
    options: IUsersFilter;
    config?: InfiniteQueryConfig<typeof UsersServices.find>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useInfiniteQuery({
      queryKey: [...(queryKey || []), UsersServices.NAME, options],
      queryFn: ({ pageParam }) => UsersServices.find({ ...options, page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.meta) return null;

        const totalFetched = allPages.reduce((count, page) => count + page.data.length, 0);
        return totalFetched < lastPage.meta.total ? lastPage.meta.page + 1 : null;
      },
      ...rest,
    });
  },

  useFindAvailableRoles: ({
    id,
    options,
    config,
  }: {
    id: TId;
    options?: { page?: number; limit?: number; searchTerm?: string };
    config?: QueryConfig<typeof UsersServices.findAvailableRoles>;
  }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), UsersServices.NAME, id, 'available-roles', options],
      queryFn: () => UsersServices.findAvailableRoles({ id, options }),
      enabled: !!id,
      ...rest,
    });
  },

  useCreate: ({ config }: { config?: MutationConfig<typeof UsersServices.create> } = {}) => {
    return useMutation({
      mutationFn: UsersServices.create,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [UsersServices.NAME] });
      },
      ...config,
    });
  },

  useUpdateRoles: ({ config }: { config?: MutationConfig<typeof UsersServices.updateRoles> } = {}) => {
    return useMutation({
      mutationFn: UsersServices.updateRoles,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [UsersServices.NAME] });
      },
      ...config,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof UsersServices.update> } = {}) => {
    return useMutation({
      mutationFn: UsersServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [UsersServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof UsersServices.delete> } = {}) => {
    return useMutation({
      mutationFn: UsersServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [UsersServices.NAME] });
      },
      ...config,
    });
  },
};