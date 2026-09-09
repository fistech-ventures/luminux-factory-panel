"use client";

import BaseFilter from "@base/components/BaseFilter";
import BaseSearch from "@base/components/BaseSearch";
import PageHeader from "@base/components/PageHeader";
import { getAuthSession } from "@modules/auth/lib/utils/client";
import { Toolbox } from "@lib/utils";
import Authorization from "@modules/auth/components/Authorization";
import WithAuthorization from "@modules/auth/components/WithAuthorization";
import SalesForm from "@modules/sales/components/SalesForm";
import SalesList from "@modules/sales/components/SalesList";
import { SalesHooks } from "@modules/sales/lib/hooks";
import { ISalesFilter } from "@modules/sales/lib/interfaces";
import { CustomersHooks } from "@modules/customers/lib/hooks";
import { Button, Drawer, Form, message, Select, Tag } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export const PAYMENT_METHODS = [
  "cash",
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "bank",
];

const SalesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    page = 1,
    limit = 10,
    ...rest
  } = Toolbox.parseQueryParams<ISalesFilter>(`?${searchParams.toString()}`);

  const salesQuery = SalesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const customersQuery = CustomersHooks.useFind({
    options: {
      page: 1,
      limit: 300,
    },
  });

  const saleCreateFn = SalesHooks.useCreate({
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
        title="Sales"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {salesQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={["sales:write"]}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <BaseFilter
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
            <Form.Item name="customerId" className="!mb-0">
              <Select
                allowClear
                showSearch
                placeholder="Customer"
                options={Toolbox.toCleanArray(
                  customersQuery.data?.data?.map((customer) => ({
                    key: customer?.id,
                    label: customer?.name,
                    value: customer?.id,
                  })),
                )}
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item name="paymentMethod" className="!mb-0">
              <Select
                allowClear
                placeholder="Payment Method"
                options={PAYMENT_METHODS.map((method) => ({
                  key: method,
                  label: method,
                  value: method,
                }))}
              />
            </Form.Item>
          </>
        }
      />
      <SalesList
        isLoading={salesQuery.isLoading}
        data={salesQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: salesQuery.data?.meta?.total,
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
        width={860}
        title="Create a new sale"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <SalesForm
          form={formInstance}
          initialValues={{
            date: new Date().toISOString(),
            soldById: getAuthSession()?.user?.id,
          }}
          isLoading={saleCreateFn.isPending}
          onFinish={(values) => saleCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(SalesPage, {
  allowedAccess: ["sales:read"],
});
