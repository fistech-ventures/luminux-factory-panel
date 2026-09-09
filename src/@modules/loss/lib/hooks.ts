import { QueryConfig } from '@lib/config';
import { useQuery } from '@tanstack/react-query';
import { ILossFilter } from './interfaces';
import { LossServices } from './services';

export const LossHooks = {
  useGetLossList: ({ options, config }: { options: ILossFilter; config?: QueryConfig<typeof LossServices.getLossList> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LossServices.NAME, 'list', options],
      queryFn: () => LossServices.getLossList(options),
      ...rest,
    });
  },

  useGetLossStats: ({ options, config }: { options: ILossFilter; config?: QueryConfig<typeof LossServices.getLossStats> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), LossServices.NAME, 'stats', options],
      queryFn: () => LossServices.getLossStats(options),
      ...rest,
    });
  },
};
