'use client';

import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import PurchasesForm from '@modules/purchases/components/PurchasesForm';
import PurchasesList from '@modules/purchases/components/PurchasesList';
import { PurchasesHooks } from '@modules/purchases/lib/hooks';
import { IPurchasesFilter } from '@modules/purchases/lib/interfaces';
import { SuppliersHooks } from '@modules/suppliers/lib/hooks';
import { Button, Drawer, Form, message, Select, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const PurchasesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 20, ...rest } = Toolbox.parseQueryParams<IPurchasesFilter>(`?${searchParams.toString()}`);

  const purchasesQuery = PurchasesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const suppliersQuery = SuppliersHooks.useFind({
    options: {
      page: 1,
      limit: 300,
    },
  });

  const purchaseCreateFn = PurchasesHooks.useCreate({
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
        title="Purchases"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {purchasesQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['purchases:write']}>
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
        extra={
          <Form.Item name="supplierId" className="mb-0!">
            <Select
              allowClear
              showSearch
              placeholder="Supplier"
              options={Toolbox.toCleanArray(
                suppliersQuery.data?.data?.map((supplier) => ({
                  key: supplier?.id,
                  label: supplier?.companyName,
                  value: supplier?.id,
                })),
              )}
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        }
      />
      <PurchasesList
        isLoading={purchasesQuery.isLoading}
        data={purchasesQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: purchasesQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={860} title="Create a new purchase" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <PurchasesForm
          form={formInstance}
          initialValues={{
            purchaseDate: new Date().toISOString(),
          }}
          isLoading={purchaseCreateFn.isPending}
          onFinish={(values) => purchaseCreateFn.mutateAsync(values)}
          _onSuccess={() => {
            setDrawerOpen(false);
            formInstance.resetFields();
          }}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(PurchasesPage, {
  allowedAccess: ['purchases:read'],
});