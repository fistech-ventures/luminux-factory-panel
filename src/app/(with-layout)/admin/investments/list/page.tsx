"use client";

import BaseFilter from "@base/components/BaseFilter";
import BaseSearch from "@base/components/BaseSearch";
import PageHeader from "@base/components/PageHeader";
import { Permissions, Paths } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import Authorization from "@modules/auth/components/Authorization";
import WithAuthorization from "@modules/auth/components/WithAuthorization";
import InvestmentsForm from "@modules/investments/components/InvestmentsForm";
import InvestmentsList from "@modules/investments/components/InvestmentsList";
import { InvestmentsHooks } from "@modules/investments/lib/hooks";
import { IInvestmentsFilter } from "@modules/investments/lib/interfaces";
import { EmployeesHooks } from "@modules/employees/lib/hooks";
import { IEmployee } from "@modules/employees/lib/interfaces";
import InfiniteScrollSelect from "@base/components/InfiniteScrollSelect";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  message,
  Row,
  Statistic,
  Tag,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const InvestmentsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>(null);
  const {
    page = 1,
    limit = 20,
    ...rest
  } = Toolbox.parseQueryParams<IInvestmentsFilter>(
    `?${searchParams.toString()}`,
  );
  const investmentsQuery = InvestmentsHooks.useFind({
    options: { ...rest, page, limit },
  });
  const employeesQuery = EmployeesHooks.useFindInfinite({
    options: { page: 1, limit: 20, searchTerm: employeeSearchTerm },
  });
  const selectedInvestorQuery = EmployeesHooks.useFindById({
    id: rest.investorId,
    config: { queryKey: [], enabled: Boolean(rest.investorId) },
  });
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
    const params = Toolbox.toCleanObject({
      ...Object.fromEntries(searchParams.entries()),
      page: nextPage,
      limit: nextLimit,
    });
    router.push(
      `${Paths.admin.investments.list}?${new URLSearchParams(params).toString()}`,
    );
  };

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Investments"
        subTitle={<BaseSearch />}
        tags={[
          <Tag key="total">
            Records: {investmentsQuery.data?.meta?.total || 0}
          </Tag>,
        ]}
        extra={
          <Authorization allowedAccess={[Permissions.INVESTMENTS_WRITE]}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} md={rest.investorId ? 12 : 24}>
          <Card loading={investmentsQuery.isLoading}>
            <Statistic
              title="Total invested by all investors"
              value={investmentsQuery.data?.total?.allInvestors || 0}
              precision={2}
            />
          </Card>
        </Col>
        {rest.investorId && (
          <Col xs={24} md={12}>
            <Card loading={investmentsQuery.isLoading}>
              <Statistic
                title="Total invested by selected investor"
                value={investmentsQuery.data?.total?.selectedInvestor || 0}
                precision={2}
              />
            </Card>
          </Col>
        )}
      </Row>

      <BaseFilter
        initialValues={Toolbox.toCleanObject(
          Object.fromEntries(searchParams.entries()),
        )}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({
            ...Object.fromEntries(searchParams.entries()),
            ...values,
            page: 1,
          });
          router.push(
            `${Paths.admin.investments.list}?${new URLSearchParams(params).toString()}`,
          );
        }}
        extra={
          <Form.Item name="investorId" className="!mb-0">
            <InfiniteScrollSelect<IEmployee>
              allowClear
              showSearch
              placeholder="Filter by investor"
              initialOptions={
                selectedInvestorQuery.data?.data
                  ? [selectedInvestorQuery.data.data]
                  : []
              }
              option={({ item }) => ({
                key: item.id,
                value: item.id,
                label: `${item.name} (${item.employeeId})`,
              })}
              onChangeSearchTerm={setEmployeeSearchTerm}
              query={employeesQuery}
            />
          </Form.Item>
        }
      />
      <InvestmentsList
        isLoading={investmentsQuery.isLoading}
        data={investmentsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: investmentsQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: goToPage,
        }}
      />
      <Drawer
        width={640}
        title="Create a new investment"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <InvestmentsForm
          form={formInstance}
          initialValues={{}}
          isLoading={createFn.isPending}
          onFinish={(values) => createFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(InvestmentsPage, {
  allowedAccess: [Permissions.INVESTMENTS_READ],
});
