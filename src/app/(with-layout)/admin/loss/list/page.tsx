"use client";

import BaseFilter from "@base/components/BaseFilter";
import BaseSearch from "@base/components/BaseSearch";
import PageHeader from "@base/components/PageHeader";
import { Toolbox } from "@lib/utils";
import WithAuthorization from "@modules/auth/components/WithAuthorization";
import { LossHooks } from "@modules/loss/lib/hooks";
import { ILossFilter } from "@modules/loss/lib/interfaces";
import LossList from "@modules/loss/components/LossList";
import { Card, Col, Form, Row, Select, Statistic, Tag } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { ENUM_PAYMENT_METHODS } from "@lib/constant";

const LossPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    page = 1,
    limit = 20,
    ...rest
  } = Toolbox.parseQueryParams<ILossFilter>(`?${searchParams.toString()}`);

  const lossListQuery = LossHooks.useGetLossList({
    options: {
      ...rest,
      page: String(page),
      limit: String(limit),
    },
  });

  const lossStatsQuery = LossHooks.useGetLossStats({
    options: {
      ...rest,
    },
  });

  const lossStats = lossStatsQuery.data?.data;

  return (
    <div className="flex flex-col gap-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={12}>
          <Card loading={lossStatsQuery.isLoading}>
            <Statistic
              title="Total Loss"
              value={lossStats?.totalLoss || 0}
              precision={2}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={12}>
          <Card loading={lossStatsQuery.isLoading}>
            <Statistic
              title="Loss Count"
              value={lossStats?.totalLossCount || 0}
            />
          </Card>
        </Col>
      </Row>
      <PageHeader
        title="Loss Entries"
        subTitle={<BaseSearch />}
        tags={[
          <Tag key={1}>Total: {lossListQuery.data?.meta?.total || 0}</Tag>,
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
            <Form.Item name="paymentMethod" className="!mb-0">
              <Select
                placeholder="Payment Method"
                options={ENUM_PAYMENT_METHODS.map((item) => ({
                  key: item,
                  label: item,
                  value: item,
                }))}
              />
            </Form.Item>
          </>
        }
      />
      <LossList
        isLoading={lossListQuery.isLoading}
        data={lossListQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: lossListQuery.data?.meta?.total,
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

export default WithAuthorization(LossPage, {
  allowedAccess: ["sales:read"],
});
