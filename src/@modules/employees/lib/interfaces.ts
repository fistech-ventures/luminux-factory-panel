import { IBaseEntity, IBaseFilter, IBaseResponse, IMetaResponse } from '@base/interfaces';

export interface IEmployee extends IBaseEntity {
  name: string;
  /** Human-facing employee code, e.g. "EMP-001" (unique). Not the uuid. */
  employeeId: string;
  phoneNumber: string;
  email?: string;
  designation?: string;
}

export interface IEmployeesFilter extends IBaseFilter {
  designation?: string;
}

export interface IEmployeesResponse extends IBaseResponse<IEmployee[]> {
  meta: IMetaResponse;
}

export interface IEmployeeCreate {
  name: string;
  employeeId: string;
  phoneNumber: string;
  email?: string;
  designation?: string;
  createdBy?: string;
}

/** Cash currently in the employee's hand (advances received - money spent). */
export interface IEmployeeBalance {
  totalAdvance: number;
  totalExpense: number;
  balance: number;
}
