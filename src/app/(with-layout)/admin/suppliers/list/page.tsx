'use client';

import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import SuppliersForm from '@modules/suppliers/components/SuppliersForm';
import SuppliersList from '@modules/suppliers/components/SuppliersList';
import { SuppliersHooks } from '@modules/suppliers/lib/hooks';
import { ISuppliersFilter } from '@modules/suppliers/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const SuppliersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 20, ...rest } = Toolbox.parseQueryParams<ISuppliersFilter>(`?${searchParams.toString()}`);

  const suppliersQuery = SuppliersHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const supplierCreateFn = SuppliersHooks.useCreate({
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
        title="Suppliers"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {suppliersQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['suppliers:write']}>
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
      <SuppliersList
        isLoading={suppliersQuery.isLoading}
        data={suppliersQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: suppliersQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new supplier" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <SuppliersForm
          form={formInstance}
          initialValues={{}}
          isLoading={supplierCreateFn.isPending}
          onFinish={(values) => supplierCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(SuppliersPage, {
  allowedAccess: ['suppliers:read'],
});