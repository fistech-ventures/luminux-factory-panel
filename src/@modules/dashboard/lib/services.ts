import { AxiosSecureInstance } from "@lib/config";
import { responseHandlerFn, Toolbox } from "@lib/utils";
import { IDashboardStatsFilter, IDashboardStatsResponse } from "./interfaces";

const END_POINT: string = "/dashboard";

export const DashboardServices = {
  NAME: END_POINT,

  getStats: async (
    options: IDashboardStatsFilter,
  ): Promise<IDashboardStatsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(
        `${END_POINT}?${Toolbox.queryNormalizer(options)}`,
      );
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
