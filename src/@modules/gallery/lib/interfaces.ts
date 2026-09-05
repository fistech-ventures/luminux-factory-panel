import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface IGalleryFilter extends IBaseFilter {}

export interface IGallery extends IBaseEntity {
  title?: string;
  caption?: string;
  source?: string;
  altText?: string;
  url: string;
  type?: string;
}

export interface IGalleryResponse extends IBaseResponse {
  data: IGallery[];
}

export interface IGalleryCreate {
  title?: string;
  caption?: string;
  source?: string;
  altText?: string;
  url: string;
}

export interface IGalleryType {
  id?: TId;
  title?: string;
  name?: string;
  type?: string;
}