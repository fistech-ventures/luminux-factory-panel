'use client';

import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import CustomersForm from '@modules/customers/components/CustomersForm';
import CustomersList from '@modules/customers/components/CustomersList';
import { CustomersHooks } from '@modules/customers/lib/hooks';
import { ICustomersFilter } from '@modules/customers/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const CustomersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<ICustomersFilter>(`?${searchParams.toString()}`);

  const customersQuery = CustomersHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const customerCreateFn = CustomersHooks.useCreate({
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
        title="Customers"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {customersQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['customers:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <BaseFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <CustomersList
        isLoading={customersQuery.isLoading}
        data={customersQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: customersQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new customer" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <CustomersForm
          form={formInstance}
          initialValues={{}}
          isLoading={customerCreateFn.isPending}
          onFinish={(values) => customerCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(CustomersPage, {
  allowedAccess: ['customers:read'],
});