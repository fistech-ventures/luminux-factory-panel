import { IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IRolesResponse } from '@modules/roles/lib/interfaces';
import { IUser, IUserCreate, IUserUpdate, IUsersFilter, IUsersResponse } from './interfaces';

const END_POINT: string = '/users';

export const UsersServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IUser>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IUsersFilter): Promise<IUsersResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findAvailableRoles: async (payload: { id: TId; options?: IBaseFilter }): Promise<IRolesResponse> => {
    try {
      const res = await AxiosSecureInstance.get(
        `${END_POINT}/${payload.id}/available-roles?${Toolbox.queryNormalizer(payload.options ?? {})}`,
      );
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  /** Staff create — roles are forced to ["Internal", "Customer"] server-side */
  create: async (payload: IUserCreate): Promise<IBaseResponse<IUser>> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/stuff`, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  updateRoles: async (payload: { id: TId; data: { roles: { role: TId; isDeleted?: boolean }[] } }): Promise<IBaseResponse<IUser>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}/roles`, payload.data);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IUserUpdate> }): Promise<IBaseResponse<IUser>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, Toolbox.toNullifyTraverse(payload.data));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  delete: async (id: TId): Promise<IBaseResponse<null>> => {
    try {
      const res = await AxiosSecureInstance.delete(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};