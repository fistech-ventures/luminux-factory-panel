'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Permissions, Paths } from '@lib/constant';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import InvestmentsForm from '@modules/investments/components/InvestmentsForm';
import InvestmentsList from '@modules/investments/components/InvestmentsList';
import { InvestmentsHooks } from '@modules/investments/lib/hooks';
import { IInvestmentsFilter } from '@modules/investments/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const InvestmentsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IInvestmentsFilter>(`?${searchParams.toString()}`);
  const investmentsQuery = InvestmentsHooks.useFind({ options: { ...rest, page, limit } });
  const createFn = InvestmentsHooks.useCreate({
    config: {
      onSuccess: (res) => {
        if (!res.success) return messageApi.error(res.message);
        setDrawerOpen(false);
        formInstance.resetFields();
        messageApi.success(res.message);
      },
    },
  });

  const goToPage = (nextPage: number, nextLimit: number) => {
    const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page: nextPage, limit: nextLimit });
    router.push(`${Paths.admin.investments.list}?${new URLSearchParams(params).toString()}`);
  };

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Investments"
        subTitle={<BaseSearch />}
        tags={[<Tag key="total">Total: {investmentsQuery.data?.meta?.total || 0}</Tag>]}
        extra={<Authorization allowedAccess={[Permissions.INVESTMENTS_WRITE]}><Button type="primary" onClick={() => setDrawerOpen(true)}>Create</Button></Authorization>}
      />
      <InvestmentsList
        isLoading={investmentsQuery.isLoading}
        data={investmentsQuery.data?.data}
        pagination={{ current: page, pageSize: limit, total: investmentsQuery.data?.meta?.total, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], onChange: goToPage }}
      />
      <Drawer width={640} title="Create a new investment" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <InvestmentsForm form={formInstance} initialValues={{}} isLoading={createFn.isPending} onFinish={(values) => createFn.mutate(values)} />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(InvestmentsPage, { allowedAccess: [Permissions.INVESTMENTS_READ] });
