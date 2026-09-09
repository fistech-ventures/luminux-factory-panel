"use client";

import WithAuthorization from "@modules/auth/components/WithAuthorization";
import { DashboardHooks } from "@modules/dashboard/lib/hooks";
import {
  Card,
  Col,
  DatePicker,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { RangePicker } = DatePicker;

const DAYS_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

const DashboardPage = () => {
  const [days, setDays] = useState<number>(7);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [recentLimit, setRecentLimit] = useState<number>(5);

  // startDate/endDate take precedence over `days` per the API contract.
  const statsOptions = useMemo(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      return {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        recentLimit,
      };
    }
    return {
      days,
      recentLimit,
    };
  }, [dateRange, days, recentLimit]);

  const dashboardStatsQuery = DashboardHooks.useGetStats({
    options: statsOptions,
  });

  const dashboardStats = dashboardStatsQuery.data?.data;
  const recentSales = dashboardStats?.recentSales ?? [];

  const salesChartData = (dashboardStats?.salesChart ?? []).map((point) => ({
    date: dayjs(point?.date).format("MMM D"),
    amount: point?.amount ?? 0,
  }));

  const profitChartData = (dashboardStats?.profitChart ?? []).map((point) => ({
    date: dayjs(point?.date).format("MMM D"),
    profit: point?.profit ?? 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <Card size="small">
        <Space wrap size="middle">
          <Space size="small">
            <span className="text-sm text-gray-500">Range:</span>
            <Select
              value={dateRange ? undefined : days}
              placeholder="Select range"
              options={DAYS_OPTIONS}
              style={{ width: 160 }}
              disabled={!!dateRange}
              onChange={(value) => setDays(value)}
            />
          </Space>
          <Space size="small">
            <span className="text-sm text-gray-500">Custom dates:</span>
            <RangePicker
              value={dateRange}
              onChange={(values) =>
                setDateRange(values as [Dayjs, Dayjs] | null)
              }
              allowClear
            />
          </Space>
          <Space size="small">
            <span className="text-sm text-gray-500">Recent sales:</span>
            <InputNumber
              min={1}
              max={50}
              value={recentLimit}
              onChange={(value) => setRecentLimit(value ?? 5)}
              style={{ width: 80 }}
            />
          </Space>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={dashboardStatsQuery.isLoading}>
            <Statistic
              title="Lifetime Sales"
              value={dashboardStats?.lifetimeSales?.amount || 0}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={dashboardStatsQuery.isLoading}>
            <Statistic
              title="Today's Sales"
              value={dashboardStats?.todaySales?.amount || 0}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={dashboardStatsQuery.isLoading}>
            <Statistic
              title="Today's Purchases"
              value={dashboardStats?.todayPurchase?.amount || 0}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={dashboardStatsQuery.isLoading}>
            <Statistic
              title="Today's Expenses"
              value={dashboardStats?.todayExpense?.amount || 0}
              precision={2}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={dashboardStatsQuery.isLoading}>
            <Statistic
              title="Total Products"
              value={dashboardStats?.totalProducts || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={dashboardStatsQuery.isLoading}>
            <Statistic
              title="Total Products Valuation"
              value={dashboardStats?.totalProductsValuation || 0}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Sales Flow" loading={dashboardStatsQuery.isLoading}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={salesChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3f8600" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3f8600" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [
                    Number(value).toFixed(2),
                    "Sales",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3f8600"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Profit Flow" loading={dashboardStatsQuery.isLoading}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={profitChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="profitGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [
                    Number(value).toFixed(2),
                    "Profit",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#1677ff"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24 }>
          <Card
            title="Recent Sales"
            loading={dashboardStatsQuery.isLoading}
            extra={
              <Tag>{dashboardStats?.todaySales?.count || 0} sale(s) today</Tag>
            }
          >
            <Table
              size="small"
              pagination={false}
              dataSource={recentSales.map((sale) => ({
                key: sale?.id,
                invoiceNo: sale?.invoiceNo,
                customer: sale?.customer?.name,
                grandTotal: sale?.grandTotal,
                paymentMethod: sale?.paymentMethod,
              }))}
              columns={[
                { key: "invoiceNo", dataIndex: "invoiceNo", title: "Invoice" },
                {
                  key: "customer",
                  dataIndex: "customer",
                  title: "Customer",
                  render: (v) => v || "N/A",
                },
                {
                  key: "grandTotal",
                  dataIndex: "grandTotal",
                  title: "Total",
                  render: (v) => (v != null ? Number(v).toFixed(2) : "N/A"),
                },
                {
                  key: "paymentMethod",
                  dataIndex: "paymentMethod",
                  title: "Payment",
                  render: (v) => v || "N/A",
                },
              ]}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WithAuthorization(DashboardPage, {
  allowedAccess: [
    "sales:read",
    "purchases:read",
    "expenses:read",
    "customers:read",
    "suppliers:read",
    "ledger:read",
  ],
});
