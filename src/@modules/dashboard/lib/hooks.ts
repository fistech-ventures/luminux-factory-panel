import { QueryConfig } from '@lib/config';
import { useQuery } from '@tanstack/react-query';
import { IDashboardStatsFilter } from './interfaces';
import { DashboardServices } from './services';

export const DashboardHooks = {
  useGetStats: ({ options, config }: { options: IDashboardStatsFilter; config?: QueryConfig<typeof DashboardServices.getStats> }) => {
    const { queryKey, ...rest } = config ?? {};

    return useQuery({
      queryKey: [...(queryKey || []), DashboardServices.NAME, options],
      queryFn: () => DashboardServices.getStats(options),
      ...rest,
    });
  },
};
