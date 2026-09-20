import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { IRole } from '@modules/roles/lib/interfaces';

export interface IUsersFilter extends IBaseFilter {
  /** JSON string array of role titles, e.g. ["Internal","Customer"] */
  roles?: string;
}

export interface IUserRoleLink {
  role: TId;
  isDeleted?: boolean;
}

export interface IUser extends IBaseEntity {
  avatar?: string;
  fullName: string;
  gender?: 'male' | 'female' | 'other';
  phoneNumber?: string;
  email: string;
  username?: string;
  roles?: IRole[];
  userRoles?: {
    role?: IRole;
    roleId?: TId;
  }[];
}

export interface IUsersResponse extends IBaseResponse {
  data: IUser[];
}

export interface IUserCreate {
  email: string;
  fullName?: string;
  gender?: 'male' | 'female' | 'other';
  phoneNumber?: string;
  password: string;
  roles?: TId[];
}

export interface IUserUpdate {
  fullName?: string;
  gender?: 'male' | 'female' | 'other';
  phoneNumber?: string;
  password?: string;
  avatar?: string;
  isActive?: boolean;
  roles?: IUserRoleLink[];
}