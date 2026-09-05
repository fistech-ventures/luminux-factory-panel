'use client';

import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import VariantsForm from '@modules/variants/components/VariantsForm';
import VariantsList from '@modules/variants/components/VariantsList';
import { VariantsHooks } from '@modules/variants/lib/hooks';
import { IVariantsFilter } from '@modules/variants/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const VariantsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IVariantsFilter>(`?${searchParams.toString()}`);

  const variantsQuery = VariantsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const variantCreateFn = VariantsHooks.useCreate({
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
        title="Variants"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {variantsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['variants:write']}>
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
      <VariantsList
        isLoading={variantsQuery.isLoading}
        data={variantsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: variantsQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new variant" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <VariantsForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={variantCreateFn.isPending}
          onFinish={(values) => variantCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(VariantsPage, {
  allowedAccess: ['variants:read'],
});