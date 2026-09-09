'use client';

import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Permissions } from '@lib/constant';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import PaymentsForm from '@modules/payments/components/PaymentsForm';
import PaymentsList from '@modules/payments/components/PaymentsList';
import { PaymentsHooks } from '@modules/payments/lib/hooks';
import { IPaymentFilter } from '@modules/payments/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const PaymentsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IPaymentFilter>(`?${searchParams.toString()}`);

  const paymentsQuery = PaymentsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const paymentCreateFn = PaymentsHooks.useCreate({
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
        title="Payments"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {paymentsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={[Permissions.PAYMENTS_WRITE]}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <BaseFilter
        showIsActive={false}
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <PaymentsList
        isLoading={paymentsQuery.isLoading}
        data={paymentsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: paymentsQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new payment" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <PaymentsForm
          form={formInstance}
          initialValues={{ paymentDate: new Date().toISOString() }}
          isLoading={paymentCreateFn.isPending}
          onFinish={(values) => paymentCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(PaymentsPage, {
  allowedAccess: ['payments:read'],
});
