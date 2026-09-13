import { IUser } from '@modules/users/lib/interfaces';

export type TId = string | number;

export type TDeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends Array<infer U>
    ? Array<TDeepPartial<U>>
    : T extends object
      ? { [P in keyof T]?: TDeepPartial<T[P]> }
      : T;

export interface IBaseFilter {
  page?: number;
  limit?: number;
  searchTerm?: string;
  isActive?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IBaseEntity {
  id: TId;
  createdBy: IUser;
  createdAt: string;
  updatedBy: IUser;
  updatedAt: string;
  isActive: boolean;
}

export interface IMetaResponse {
  total: number;
  page: number;
  limit: number;
  skip: number;
}

export interface ISEOMetaData {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
}

export interface IBaseResponse<D = any> {
  success: boolean;
  statusCode: number;
  message: string;
  meta: IMetaResponse;
  data: D;
}

export interface IBaseServices<Entity = any, FilterOptions = any, CreatePayload = any, UpdatePayload = CreatePayload> {
  END_POINT: string;
  findById(id: TId): Promise<IBaseResponse<Entity>>;
  find(options: FilterOptions): Promise<IBaseResponse<Entity[]>>;
  create(payload: CreatePayload): Promise<IBaseResponse<Entity>>;
  update(payload: { id: TId; data: Partial<UpdatePayload> }): Promise<IBaseResponse<Entity>>;
  delete(id: TId): Promise<IBaseResponse<Entity>>;
}
