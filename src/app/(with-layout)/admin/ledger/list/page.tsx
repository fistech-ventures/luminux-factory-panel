'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import LedgerFilter from '@modules/ledger/components/LedgerFilter';
import LedgerForm from '@modules/ledger/components/LedgerForm';
import LedgerList from '@modules/ledger/components/LedgerList';
import { LedgerHooks } from '@modules/ledger/lib/hooks';
import { ILedgerFilter } from '@modules/ledger/lib/interfaces';
import { Button, Drawer, Form, message, Statistic, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const LedgerPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<ILedgerFilter>(`?${searchParams.toString()}`);

  const hasEntityFilter = !!rest?.entityType && !!rest?.entityId;

  const filteredLedgerQuery = LedgerHooks.useFindFiltered({
    options: {
      ...rest,
      page,
      limit,
    },
    config: {
      queryKey: [],
      enabled: hasEntityFilter,
    },
  });

  const rawLedgerQuery = LedgerHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
    config: {
      queryKey: [],
      enabled: !hasEntityFilter,
    },
  });

  const ledgerQuery = hasEntityFilter ? filteredLedgerQuery : rawLedgerQuery;

  const customerBalanceQuery = LedgerHooks.useGetCustomerBalance({
    customerId: rest?.entityType === 'customer' ? rest?.entityId : null,
  });

  const supplierBalanceQuery = LedgerHooks.useGetSupplierBalance({
    supplierId: rest?.entityType === 'supplier' ? rest?.entityId : null,
  });

  const balance = rest?.entityType === 'supplier' ? supplierBalanceQuery.data?.data : customerBalanceQuery.data?.data;

  const ledgerCreateFn = LedgerHooks.useCreate({
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
        title="Ledger"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {ledgerQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['ledger:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create Entry
            </Button>
          </Authorization>
        }
      />
      {hasEntityFilter && balance && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white dark:bg-[var(--color-rich-black)] border border-gray-200 rounded-lg p-4">
            <Statistic title="Total Due" value={balance?.totalDue ?? 0} precision={2} />
          </div>
          <div className="bg-white dark:bg-[var(--color-rich-black)] border border-gray-200 rounded-lg p-4">
            <Statistic title="Total Paid" value={balance?.totalPaid ?? 0} precision={2} />
          </div>
          <div className="bg-white dark:bg-[var(--color-rich-black)] border border-gray-200 rounded-lg p-4">
            <Statistic
              title="Balance"
              value={balance?.balance ?? 0}
              precision={2}
              valueStyle={{ color: (balance?.balance ?? 0) > 0 ? '#cf1322' : '#3f8600' }}
            />
          </div>
        </div>
      )}
      <LedgerFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({
            ...Object.fromEntries(searchParams.entries()),
            ...values,
            page: 1,
          });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <LedgerList
        isLoading={ledgerQuery.isLoading}
        data={ledgerQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: ledgerQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new ledger entry" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <LedgerForm
          form={formInstance}
          initialValues={{
            transactionDate: new Date().toISOString(),
            entityType: rest?.entityType || 'customer',
            entityId: rest?.entityId,
          }}
          isLoading={ledgerCreateFn.isPending}
          onFinish={(values) => ledgerCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(LedgerPage, {
  allowedAccess: ['ledger:read'],
});