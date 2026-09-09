'use client';

import BaseFilter from '@base/components/BaseFilter';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Permissions } from '@lib/constant';
import { Toolbox } from '@lib/utils';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { ProfitHooks } from '@modules/profit/lib/hooks';
import { IProfitFilter } from '@modules/profit/lib/interfaces';
import ProfitList from '@modules/profit/components/ProfitList';
import { Card, Col, Row, Statistic, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

const ProfitPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IProfitFilter>(`?${searchParams.toString()}`);

  const profitListQuery = ProfitHooks.useGetProfitList({
    options: {
      ...rest,
      page: String(page),
      limit: String(limit),
    },
  });

  const profitStatsQuery = ProfitHooks.useGetProfitStats({
    options: {
      ...rest,
    },
  });

  const profitStats = profitStatsQuery.data?.data;

  return (
    <div className="flex flex-col gap-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={profitStatsQuery.isLoading}>
            <Statistic 
              title="Total Income" 
              value={profitStats?.totalIncome || 0} 
              precision={2} 
              valueStyle={{ color: '#3f8600' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={profitStatsQuery.isLoading}>
            <Statistic 
              title="Total Cost" 
              value={profitStats?.totalCostOfGoodsSold || 0} 
              precision={2} 
              valueStyle={{ color: '#cf1322' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={profitStatsQuery.isLoading}>
            <Statistic 
              title="Sales Profit" 
              value={profitStats?.totalSalesProfit || 0} 
              precision={2} 
              valueStyle={{ color: '#3f8600' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={profitStatsQuery.isLoading}>
            <Statistic 
              title="Net Profit" 
              value={profitStats?.netProfit || 0} 
              precision={2} 
              valueStyle={{ color: profitStats?.netProfit >= 0 ? '#3f8600' : '#cf1322' }} 
            />
          </Card>
        </Col>
      </Row>
      <PageHeader
        title="Profit Entries"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {profitListQuery.data?.meta?.total || 0}</Tag>]}
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
      <ProfitList
        isLoading={profitListQuery.isLoading}
        data={profitListQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: profitListQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
    </div>
  );
};

export default WithAuthorization(ProfitPage, {
  allowedAccess: ['sales:read'],
});
