'use client';

import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { ExpensesHooks } from '@modules/expenses/lib/hooks';
import { PurchasesHooks } from '@modules/purchases/lib/hooks';
import { SalesHooks } from '@modules/sales/lib/hooks';
import { ProductsHooks } from '@modules/products/lib/hooks';
import { Card, Col, Row, Statistic, Table, TableColumnsType, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const DashboardPage = () => {
  const today = dayjs().format('YYYY-MM-DD');

  const todaySalesQuery = SalesHooks.useFind({
    options: {
      startDate: today,
      endDate: today,
      limit: 100,
      page: 1,
    },
  });

  const todayPurchasesQuery = PurchasesHooks.useFind({
    options: {
      startDate: today,
      endDate: today,
      limit: 100,
      page: 1,
    },
  });

  const todayExpensesQuery = ExpensesHooks.useFind({
    options: {
      startDate: today,
      endDate: today,
      limit: 100,
      page: 1,
    },
  });

  const productsCountQuery = ProductsHooks.useFind({
    options: {
      limit: 1,
      page: 1,
    },
  });

  const lowStockQuery = ProductsHooks.useFind({
    options: {
      limit: 8,
      page: 1,
      sortBy: 'stock',
      sortOrder: 'ASC',
    },
  });

  const todaySales = todaySalesQuery.data?.data ?? [];
  const todayPurchases = todayPurchasesQuery.data?.data ?? [];
  const todayExpenses = todayExpensesQuery.data?.data ?? [];

  const salesAmount = todaySales.reduce((sum, sale) => sum + (Number(sale.grandTotal) || 0), 0);
  const purchasesAmount = todayPurchases.reduce(
    (sum, purchase) => sum + (Number(purchase.totalPurchaseAmount) || 0),
    0,
  );
  const expensesAmount = todayExpenses.reduce((sum, expense) => sum + (Number(expense.amountSpent) || 0), 0);

  const lowStockDataSource = (lowStockQuery.data?.data ?? [])
    .map((product) => ({
      key: product?.id,
      title: product?.title,
      productCode: product?.productCode,
      stock: product?.stock ?? 0,
    }))
    .sort((a, b) => a.stock - b.stock);

  const lowStockColumns: TableColumnsType<(typeof lowStockDataSource)[number]> = [
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Product',
    },
    {
      key: 'productCode',
      dataIndex: 'productCode',
      title: 'Code',
      render: (productCode) => productCode || 'N/A',
    },
    {
      key: 'stock',
      dataIndex: 'stock',
      title: 'Stock',
      render: (stock) => <Tag color={stock <= 5 ? 'red' : stock <= 10 ? 'orange' : 'green'}>{stock}</Tag>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Today's Sales" value={salesAmount} precision={2} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Today's Purchases" value={purchasesAmount} precision={2} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Today's Expenses" value={expensesAmount} precision={2} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Products" value={productsCountQuery.data?.meta?.total ?? 0} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Recent Sales"
            loading={todaySalesQuery.isLoading}
            extra={
              <Tag>
                {todaySalesQuery.data?.meta?.total ?? 0} sale(s) today
              </Tag>
            }
          >
            <Table
              size="small"
              pagination={false}
              dataSource={todaySales.slice(0, 5).map((sale) => ({
                key: sale?.id,
                invoiceNo: sale?.invoiceNo,
                customer: sale?.customer?.name,
                grandTotal: sale?.grandTotal,
                paymentMethod: sale?.paymentMethod,
              }))}
              columns={[
                { key: 'invoiceNo', dataIndex: 'invoiceNo', title: 'Invoice' },
                { key: 'customer', dataIndex: 'customer', title: 'Customer', render: (v) => v || 'N/A' },
                {
                  key: 'grandTotal',
                  dataIndex: 'grandTotal',
                  title: 'Total',
                  render: (v) => (v != null ? Number(v).toFixed(2) : 'N/A'),
                },
                { key: 'paymentMethod', dataIndex: 'paymentMethod', title: 'Payment', render: (v) => v || 'N/A' },
              ]}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Low Stock Products" loading={lowStockQuery.isLoading}>
            <Table
              size="small"
              pagination={false}
              dataSource={lowStockDataSource}
              columns={lowStockColumns}
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
    'sales:read',
    'purchases:read',
    'expenses:read',
    'products:read',
    'customers:read',
    'suppliers:read',
    'ledger:read',
  ],
});