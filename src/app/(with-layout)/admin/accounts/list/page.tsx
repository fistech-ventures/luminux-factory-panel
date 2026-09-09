"use client";

import BaseFilter from "@base/components/BaseFilter";
import BaseSearch from "@base/components/BaseSearch";
import PageHeader from "@base/components/PageHeader";
import { Toolbox } from "@lib/utils";
import WithAuthorization from "@modules/auth/components/WithAuthorization";
import { AccountsHooks } from "@modules/accounts/lib/hooks";
import { IAccountTransactionsFilter } from "@modules/accounts/lib/interfaces";
import AccountsList from "@modules/accounts/components/AccountsList";
import { Card, Col, Form, Row, Select, Statistic, Tag } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { PAYMENT_METHODS } from "../../sales/list/page";

const AccountsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    page = 1,
    limit = 10,
    ...rest
  } = Toolbox.parseQueryParams<IAccountTransactionsFilter>(
    `?${searchParams.toString()}`,
  );

  const accountsBalancesQuery = AccountsHooks.useGetBalances();

  const accountsTransactionsQuery = AccountsHooks.useGetTransactions({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const balances = accountsBalancesQuery.data?.data?.accounts ?? [];
  const totalBalance = accountsBalancesQuery.data?.data?.totalBalance ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={accountsBalancesQuery.isLoading}>
            <Statistic
              title="Total Balance"
              value={totalBalance}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        {balances.map((balance) => (
          <Col key={balance.paymentMethod} xs={24} sm={12} lg={6}>
            <Card loading={accountsBalancesQuery.isLoading}>
              <Statistic
                title={balance.paymentMethod}
                value={balance.balance}
                precision={2}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <PageHeader
        title="Account Transactions"
        subTitle={<BaseSearch />}
        tags={[
          <Tag key={1}>
            Total: {accountsTransactionsQuery.data?.data?.total || 0}
          </Tag>,
          <Tag key={2} color="green">
            Cash In:{" "}
            {accountsTransactionsQuery.data?.data?.totalCashIn?.toFixed(2) || 0}
          </Tag>,
          <Tag key={3} color="red">
            Cash Out:{" "}
            {accountsTransactionsQuery.data?.data?.totalCashOut?.toFixed(2) ||
              0}
          </Tag>,
        ]}
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
            <Form.Item name="accountType" className="!mb-0">
              <Select
                allowClear
                placeholder="Account Type"
                options={PAYMENT_METHODS.map((method) => ({
                  key: method,
                  label: method,
                  value: method,
                }))}
              />
            </Form.Item>
            <Form.Item name="transactionType" className="!mb-0">
              <Select
                allowClear
                placeholder="Transaction Type"
                options={[
                  { key: "CASH_IN", label: "Cash In", value: "cashIn" },
                  { key: "CASH_OUT", label: "Cash Out", value: "cashOut" },
                ]}
              />
            </Form.Item>
          </>
        }
      />
      <AccountsList
        isLoading={accountsTransactionsQuery.isLoading}
        data={accountsTransactionsQuery?.data?.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: accountsTransactionsQuery.data?.data?.total,
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
    </div>
  );
};

export default WithAuthorization(AccountsPage, {
  allowedAccess: ["sales:read", "purchases:read", "expenses:read"],
});
