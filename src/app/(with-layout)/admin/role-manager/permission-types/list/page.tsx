'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { IBaseFilter } from '@base/interfaces';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import PermissionTypesForm from '@modules/permission-types/components/PermissionTypesForm';
import PermissionTypesList from '@modules/permission-types/components/PermissionTypesList';
import { PermissionTypesHooks } from '@modules/permission-types/lib/hooks';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const PermissionTypesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 20, ...rest } = Toolbox.parseQueryParams<IBaseFilter>(`?${searchParams.toString()}`);

  const permissionTypesQuery = PermissionTypesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const permissionTypeCreateFn = PermissionTypesHooks.useCreate({
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

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Permission Types"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {permissionTypesQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['role-manager-permission-types:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <PermissionTypesList
        isLoading={permissionTypesQuery.isLoading}
        data={permissionTypesQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: permissionTypesQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={450} title="Create a new permission type" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <PermissionTypesForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={permissionTypeCreateFn.isPending}
          onFinish={(values) => permissionTypeCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(PermissionTypesPage, {
  allowedAccess: ['role-manager-permission-types:read'],
});
