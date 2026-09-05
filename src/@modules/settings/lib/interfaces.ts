import { IBaseResponse } from '@base/interfaces';

export interface ISettingsSocialUrls {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface ISettings {
  name: string;
  initialName: string;
  icon?: string;
  logo?: string;
  themePrimaryColor: string;
  themeSecondayColor: string;
  phoneCode: string;
  currency: string;
  description?: string;
  phone?: string;
  address?: string;
  socialUrls?: ISettingsSocialUrls;
  allowUserRegistration: boolean;
  userRegistrationVerificationRequired: boolean;
  needWebView: boolean;
  otpExpiresInMin: number;
}

export interface ISettingsResponse extends IBaseResponse {
  data: ISettings;
}

export type ISettingsCreate = Partial<ISettings>;