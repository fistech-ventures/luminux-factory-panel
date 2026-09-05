'use client';

import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import ProductsForm from '@modules/products/components/ProductsForm';
import ProductsList from '@modules/products/components/ProductsList';
import { ProductsHooks } from '@modules/products/lib/hooks';
import { IProductsFilter } from '@modules/products/lib/interfaces';
import { Button, Drawer, Form, Input, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const ProductsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IProductsFilter>(`?${searchParams.toString()}`);

  const productsQuery = ProductsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const productCreateFn = ProductsHooks.useCreate({
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
        title="Products"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {productsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['products:write']}>
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
          <Form.Item name="productCode" className="!mb-0">
            <Input allowClear placeholder="Product Code (exact)" />
          </Form.Item>
        }
      />
      <ProductsList
        isLoading={productsQuery.isLoading}
        data={productsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: productsQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={760} title="Create a new product" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <ProductsForm
          form={formInstance}
          isLoading={productCreateFn.isPending}
          onFinish={(values) => productCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(ProductsPage, {
  allowedAccess: ['products:read'],
});