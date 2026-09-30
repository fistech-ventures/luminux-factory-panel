'use client';

import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import ProductVariantOptionsForm from '@modules/product-variant-options/components/ProductVariantOptionsForm';
import ProductVariantOptionsList from '@modules/product-variant-options/components/ProductVariantOptionsList';
import { ProductVariantOptionsHooks } from '@modules/product-variant-options/lib/hooks';
import { IProductVariantOptionsFilter } from '@modules/product-variant-options/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const ProductVariantOptionsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 20, ...rest } = Toolbox.parseQueryParams<IProductVariantOptionsFilter>(
    `?${searchParams.toString()}`,
  );

  const itemsQuery = ProductVariantOptionsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const itemCreateFn = ProductVariantOptionsHooks.useCreate({
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
        title="Product Variant Options"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {itemsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['product-variant-options:write']}>
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
      <ProductVariantOptionsList
        isLoading={itemsQuery.isLoading}
        data={itemsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: itemsQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer
        width={640}
        title="Create a new product variant option"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <ProductVariantOptionsForm
          form={formInstance}
          isLoading={itemCreateFn.isPending}
          onFinish={(values) => itemCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(ProductVariantOptionsPage, {
  allowedAccess: ['product-variant-options:read'],
});