import { TId } from '@base/interfaces';
import { MutationConfig, queryClient, QueryConfig } from '@lib/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IGalleryFilter } from './interfaces';
import { GalleryServices } from './services';

export const GalleryHooks = {
  useFindById: ({ id, config }: { id: TId; config?: QueryConfig<typeof GalleryServices.findById> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), GalleryServices.NAME, id],
      queryFn: () => GalleryServices.findById(id),
      ...rest,
    });
  },

  useFind: ({ options, config }: { options: IGalleryFilter; config?: QueryConfig<typeof GalleryServices.find> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), GalleryServices.NAME, options],
      queryFn: () => GalleryServices.find(options),
      ...rest,
    });
  },

  useFindTypes: ({ config }: { config?: QueryConfig<typeof GalleryServices.findTypes> } = {}) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), GalleryServices.NAME, 'types'],
      queryFn: () => GalleryServices.findTypes(),
      ...rest,
    });
  },

  useUpdate: ({ config }: { config?: MutationConfig<typeof GalleryServices.update> } = {}) => {
    return useMutation({
      mutationFn: GalleryServices.update,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [GalleryServices.NAME] });
      },
      ...config,
    });
  },

  useDeleteBulk: ({ config }: { config?: MutationConfig<typeof GalleryServices.deleteBulk> } = {}) => {
    return useMutation({
      mutationFn: GalleryServices.deleteBulk,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [GalleryServices.NAME] });
      },
      ...config,
    });
  },

  useDelete: ({ config }: { config?: MutationConfig<typeof GalleryServices.delete> } = {}) => {
    return useMutation({
      mutationFn: GalleryServices.delete,
      onSettled: (data) => {
        if (!data?.success) return;

        queryClient.invalidateQueries({ queryKey: [GalleryServices.NAME] });
      },
      ...config,
    });
  },
};