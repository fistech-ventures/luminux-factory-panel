'use client';

import { Env } from '.environments';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { ENUM_API_SCOPE_TYPES } from '@lib/interfaces/apiScope.interface';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { getAuthToken } from '@modules/auth/lib/utils/client';
import GalleryList from '@modules/gallery/components/GalleryList';
import { GalleryHooks } from '@modules/gallery/lib/hooks';
import { IGalleryFilter } from '@modules/gallery/lib/interfaces';
import type { UploadFile } from 'antd';
import { Button, message, Tag, Upload } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { AiOutlineDelete, AiOutlineUpload } from 'react-icons/ai';

const GalleryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { page = 1, limit = 20, ...rest } = Toolbox.parseQueryParams<IGalleryFilter>(`?${searchParams.toString()}`);

  const galleryQuery = GalleryHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const galleryTypesQuery = GalleryHooks.useFindTypes();

  const galleryDeleteBulkFn = GalleryHooks.useDeleteBulk({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setSelectedRowKeys([]);
        messageApi.success(res.message);
      },
    },
  });

  const handleUploadChangeFn = ({ file, fileList: newFileList }: any) => {
    setFileList(newFileList);

    if (file?.status === 'done') {
      messageApi.success(`${file.name} uploaded successfully.`);
      galleryQuery.refetch();
    } else if (file?.status === 'error') {
      messageApi.error(`${file.name} upload failed.`);
    }
  };

  const types = galleryTypesQuery.data?.data ?? [];

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Gallery"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {galleryQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['gallery:write']}>
            <Upload
              name="files"
              multiple
              fileList={fileList}
              headers={{ Authorization: `Bearer ${getAuthToken()}` }}
              action={`${Env.apiUrl.replace('{{scope}}', ENUM_API_SCOPE_TYPES.INTERNAL)}/gallery/uploads`}
              onChange={handleUploadChangeFn}
              showUploadList={false}
              accept="image/*,video/*"
            >
              <Button type="primary" icon={<AiOutlineUpload />}>
                Upload
              </Button>
            </Upload>
          </Authorization>
        }
      />
      {selectedRowKeys.length > 0 && (
        <div className="flex justify-end mb-4">
          <Authorization allowedAccess={['gallery:delete']}>
            <Button
              danger
              icon={<AiOutlineDelete />}
              onClick={() => galleryDeleteBulkFn.mutate(selectedRowKeys as string[])}
              loading={galleryDeleteBulkFn.isPending}
            >
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </Authorization>
        </div>
      )}
      {types.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {types.map((type, idx) => (
            <Tag key={type?.id || idx} color="blue">
              {type?.title || type?.name || type?.type}
            </Tag>
          ))}
        </div>
      )}
      <GalleryList
        isLoading={galleryQuery.isLoading}
        data={galleryQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: galleryQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
        onSelectionChange={setSelectedRowKeys}
      />
    </React.Fragment>
  );
};

export default WithAuthorization(GalleryPage, {
  allowedAccess: ['gallery:read'],
});