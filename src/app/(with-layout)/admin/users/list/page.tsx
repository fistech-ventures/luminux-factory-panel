'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import UsersFilter from '@modules/users/components/UsersFilter';
import UsersForm from '@modules/users/components/UsersForm';
import UsersList from '@modules/users/components/UsersList';
import { UsersHooks } from '@modules/users/lib/hooks';
import { IUsersFilter } from '@modules/users/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const UsersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 20, ...rest } = Toolbox.parseQueryParams<IUsersFilter>(`?${searchParams.toString()}`);

  const usersQuery = UsersHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const userCreateFn = UsersHooks.useCreate({
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
        title="Users"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {usersQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['users:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create Staff
            </Button>
          </Authorization>
        }
      />
      <UsersFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <UsersList
        isLoading={usersQuery.isLoading}
        data={usersQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: usersQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new staff user" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <UsersForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={userCreateFn.isPending}
          onFinish={(values) => userCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(UsersPage, { allowedAccess: ['users:read'] });