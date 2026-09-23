'use client';

import FloatInput from '@base/antd/components/FloatInput';
import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Permissions } from '@lib/constant';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import EmployeesForm from '@modules/employees/components/EmployeesForm';
import EmployeesList from '@modules/employees/components/EmployeesList';
import { EmployeesHooks } from '@modules/employees/lib/hooks';
import { IEmployeesFilter } from '@modules/employees/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const EmployeesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    page = 1,
    limit = 10,
    ...rest
  } = Toolbox.parseQueryParams<IEmployeesFilter>(`?${searchParams.toString()}`);

  const employeesQuery = EmployeesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const employeeCreateFn = EmployeesHooks.useCreate({
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
        title="Employees"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {employeesQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={[Permissions.EMPLOYEES_WRITE]}>
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
          const params = Toolbox.toCleanObject({
            ...Object.fromEntries(searchParams.entries()),
            ...values,
          });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
        extra={
          <Form.Item name="designation" className="!mb-0">
            <FloatInput placeholder="Designation" />
          </Form.Item>
        }
      />
      <EmployeesList
        isLoading={employeesQuery.isLoading}
        data={employeesQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: employeesQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({
              ...Object.fromEntries(searchParams.entries()),
              page,
              limit,
            });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer
        width={640}
        title="Create a new employee"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <EmployeesForm
          form={formInstance}
          initialValues={{}}
          isLoading={employeeCreateFn.isPending}
          onFinish={(values) => employeeCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(EmployeesPage, {
  allowedAccess: [Permissions.EMPLOYEES_READ],
});
