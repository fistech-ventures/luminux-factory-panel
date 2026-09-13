"use client";

import FloatInput from "@base/antd/components/FloatInput";
import BaseFilter from "@base/components/BaseFilter";
import BaseSearch from "@base/components/BaseSearch";
import PageHeader from "@base/components/PageHeader";
import { ENUM_PAYMENT_METHODS } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import Authorization from "@modules/auth/components/Authorization";
import WithAuthorization from "@modules/auth/components/WithAuthorization";
import ExpensesForm from "@modules/expenses/components/ExpensesForm";
import ExpensesList from "@modules/expenses/components/ExpensesList";
import { ExpensesHooks } from "@modules/expenses/lib/hooks";
import { IExpensesFilter } from "@modules/expenses/lib/interfaces";
import { Button, Drawer, Form, message, Select, Tag } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const ExpensesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    page = 1,
    limit = 10,
    ...rest
  } = Toolbox.parseQueryParams<IExpensesFilter>(`?${searchParams.toString()}`);

  const expensesQuery = ExpensesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const expenseCreateFn = ExpensesHooks.useCreate({
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
        title="Expenses"
        subTitle={<BaseSearch />}
        tags={[
          <Tag key={1}>Total: {expensesQuery.data?.meta?.total || 0}</Tag>,
        ]}
        extra={
          <Authorization allowedAccess={["expenses:write"]}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <BaseFilter
        showIsActive={false}
        initialValues={Toolbox.toCleanObject(
          Object.fromEntries(searchParams.entries()),
        )}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({
            ...Object.fromEntries(searchParams.entries()),
            ...values,
          });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
        extra={
          <>
            <Form.Item name="spentBy" className="!mb-0">
              <FloatInput placeholder="Spent By" />
            </Form.Item>
            <Form.Item name="paymentMethod" className="!mb-0">
              <Select
                placeholder="Payment Method"
                options={ENUM_PAYMENT_METHODS.map((method) => ({
                  value: method,
                  label: method,
                }))}
              />
            </Form.Item>
          </>
        }
      />
      <ExpensesList
        isLoading={expensesQuery.isLoading}
        data={expensesQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: expensesQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
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
        title="Create a new expense"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <ExpensesForm
          form={formInstance}
          initialValues={{ date: new Date().toISOString() }}
          isLoading={expenseCreateFn.isPending}
          onFinish={(values) => expenseCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(ExpensesPage, {
  allowedAccess: ["expenses:read"],
});
