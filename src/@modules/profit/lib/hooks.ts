import { QueryConfig } from '@lib/config';
import { useQuery } from '@tanstack/react-query';
import { IProfitFilter } from './interfaces';
import { ProfitServices } from './services';

export const ProfitHooks = {
  useGetProfitList: ({ options, config }: { options: IProfitFilter; config?: QueryConfig<typeof ProfitServices.getProfitList> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ProfitServices.NAME, 'list', options],
      queryFn: () => ProfitServices.getProfitList(options),
      ...rest,
    });
  },

  useGetProfitStats: ({ options, config }: { options: IProfitFilter; config?: QueryConfig<typeof ProfitServices.getProfitStats> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), ProfitServices.NAME, 'stats', options],
      queryFn: () => ProfitServices.getProfitStats(options),
      ...rest,
    });
  },
};
