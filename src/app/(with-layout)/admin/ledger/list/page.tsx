'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import LedgerFilter from '@modules/ledger/components/LedgerFilter';
import LedgerList from '@modules/ledger/components/LedgerList';
import { LedgerHooks } from '@modules/ledger/lib/hooks';
import { ILedgerFilter } from '@modules/ledger/lib/interfaces';
import { message, Statistic, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

const LedgerPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, messageHolder] = message.useMessage();
  const { page = 1, limit = 20, ...rest } = Toolbox.parseQueryParams<ILedgerFilter>(`?${searchParams.toString()}`);

  const hasEntityFilter = !!rest?.entityType && !!rest?.entityId;
  const isEmployee = rest?.entityType === 'employee';

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

  const employeeBalanceQuery = LedgerHooks.useGetEmployeeBalance({
    employeeId: isEmployee ? rest?.entityId : null,
  });

  const accountBalance =
    rest?.entityType === 'supplier'
      ? supplierBalanceQuery.data?.data
      : rest?.entityType === 'customer'
        ? customerBalanceQuery.data?.data
        : null;
  const employeeBalance = isEmployee ? employeeBalanceQuery.data?.data : null;

  const summaryItems = isEmployee
    ? [
        { title: 'Total Advance', value: employeeBalance?.totalAdvance ?? 0, colorized: false },
        { title: 'Total Expense', value: employeeBalance?.totalExpense ?? 0, colorized: false },
        {
          title: 'Cash In Hand',
          value: employeeBalance?.balance ?? 0,
          colorized: true,
          negativeIsBad: true,
        },
      ]
    : [
        { title: 'Total Due', value: accountBalance?.totalDue ?? 0, colorized: false },
        { title: 'Total Paid', value: accountBalance?.totalPaid ?? 0, colorized: false },
        { title: 'Balance', value: accountBalance?.balance ?? 0, colorized: true, negativeIsBad: false },
      ];

  const hasBalance = isEmployee ? !!employeeBalance : !!accountBalance;

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Ledger"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {ledgerQuery.data?.meta?.total || 0}</Tag>]}
      />
      {hasEntityFilter && hasBalance && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {summaryItems.map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-[var(--color-rich-black)] border border-gray-200 rounded-lg p-4"
            >
              <Statistic
                title={item.title}
                value={item.value}
                precision={2}
                valueStyle={
                  item.colorized
                    ? { color: item.value < 0 ? '#cf1322' : '#3f8600' }
                    : undefined
                }
              />
            </div>
          ))}
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
    </React.Fragment>
  );
};

export default WithAuthorization(LedgerPage, {
  allowedAccess: ['ledger:read'],
});
