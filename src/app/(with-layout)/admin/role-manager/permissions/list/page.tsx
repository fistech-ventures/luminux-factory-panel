'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Permissions } from '@lib/constant';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import PermissionsForm from '@modules/permissions/components/PermissionsForm';
import PermissionsList from '@modules/permissions/components/PermissionsList';
import { PermissionsHooks } from '@modules/permissions/lib/hooks';
import { IPermissionsFilter } from '@modules/permissions/lib/interfaces';
import { Button, Drawer, Form, message, Space, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const PermissionsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 20, ...rest } = Toolbox.parseQueryParams<IPermissionsFilter>(`?${searchParams.toString()}`);

  const permissionsQuery = PermissionsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const permissionCreateFn = PermissionsHooks.useCreate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setDrawerOpen(false);
        formInstance.resetFields();
        messageApi.success(res.message);
      },
    },
  });

  const permissionBulkSyncFn = PermissionsHooks.useBulkSync({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        messageApi.success(res.message);
      },
    },
  });

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Permissions"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {permissionsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Space>
            <Authorization allowedAccess={['role-manager-permissions:write']}>
              <Button
                type="primary"
                onClick={() => permissionBulkSyncFn.mutate({ permissions: Object.values(Permissions) })}
                ghost
              >
                Sync
              </Button>
            </Authorization>
            <Authorization allowedAccess={['role-manager-permissions:write']}>
              <Button type="primary" onClick={() => setDrawerOpen(true)}>
                Create
              </Button>
            </Authorization>
          </Space>
        }
      />
      <PermissionsList
        isLoading={permissionsQuery.isLoading}
        data={permissionsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: permissionsQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={450} title="Create a new permission" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <PermissionsForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={permissionCreateFn.isPending}
          onFinish={(values) => permissionCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(PermissionsPage, {
  allowedAccess: ['role-manager-permissions:read'],
});
