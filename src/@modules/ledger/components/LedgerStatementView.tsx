'use client';

import { Alert, Card, Empty, Spin, Statistic, Table, Tag, Typography, Button } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { FiPrinter } from 'react-icons/fi';
import { ILedgerStatement, ILedgerStatementOptions, ILedgerStatementRow } from '../lib/interfaces';

interface IProps {
  options: ILedgerStatementOptions;
  query: { data?: { data?: ILedgerStatement }; isLoading: boolean; error: unknown };
}

const missingValue = '—';

export const formatStatementMoney = (value: number | null | undefined) =>
  value == null || !Number.isFinite(Number(value)) ? missingValue : Number(value).toFixed(2);

export const formatStatementQty = (value: number | null | undefined) =>
  value == null || !Number.isFinite(Number(value)) ? missingValue : String(Math.trunc(Number(value)));

export const formatStatementDate = (value: string | null | undefined) => {
  const parsed = value ? dayjs(value) : null;
  return parsed?.isValid() ? parsed.format('MMM D, YYYY') : missingValue;
};

const printUrl = (options: ILedgerStatementOptions) => {
  const params = new URLSearchParams({ entityType: options.entityType, entityId: String(options.entityId) });
  if (options.startDate) params.set('startDate', options.startDate);
  if (options.endDate) params.set('endDate', options.endDate);
  return `/ledger/statement/print?${params.toString()}`;
};

const LedgerStatementView: React.FC<IProps> = ({ options, query }) => {
  const statement = query.data?.data;

  if (query.isLoading) return <div className="flex justify-center py-12"><Spin /></div>;
  if (query.error) return <Alert type="error" showIcon message="Unable to load the statement." />;
  if (!statement) return <Empty description="No statement found." />;

  const columns = [
    { title: 'Date', dataIndex: 'date', render: (value: string) => formatStatementDate(value) },
    { title: 'Particulars', dataIndex: 'particulars', render: (value: string | null) => value || missingValue },
    { title: 'Narration', dataIndex: 'narration', render: (value: string) => value || missingValue, width: 280 },
    { title: 'Invoice No.', dataIndex: 'invoiceNo', render: (value: string | null) => value || missingValue },
    { title: 'Qty', dataIndex: 'qty', align: 'right' as const, render: formatStatementQty },
    { title: 'Gross', dataIndex: 'gross', align: 'right' as const, render: formatStatementMoney },
    { title: 'Debit', dataIndex: 'debit', align: 'right' as const, render: formatStatementMoney },
    { title: 'Credit', dataIndex: 'credit', align: 'right' as const, render: formatStatementMoney },
    { title: 'Balance', dataIndex: 'balance', align: 'right' as const, render: formatStatementMoney },
  ];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Typography.Title level={3} className="!mb-0">Statement of Account</Typography.Title>
        <Button icon={<FiPrinter />} onClick={() => window.open(printUrl(options), '_blank', 'noopener,noreferrer')}>
          Print
        </Button>
      </div>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Typography.Title level={4} className="!mb-1">{statement.party.name}</Typography.Title>
            {statement.party.customerType && <Tag>{statement.party.customerType}</Tag>}
            <div className="mt-2 text-gray-500">
              <div>{statement.party.contactNumber || missingValue}</div>
              <div>{statement.party.address || missingValue}</div>
            </div>
          </div>
          <Typography.Text type="secondary">
            {statement.startDate && statement.endDate
              ? `${formatStatementDate(statement.startDate)} - ${formatStatementDate(statement.endDate)}`
              : 'All time'}
          </Typography.Text>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mt-3">
        <Card><Statistic title="Opening Balance" value={formatStatementMoney(statement.openingBalance)} /></Card>
        <Card><Statistic title="Gross Total" value={formatStatementMoney(statement.totals.grossTotal)} /></Card>
        <Card><Statistic title="Debit Total" value={formatStatementMoney(statement.totals.debitTotal)} /></Card>
        <Card><Statistic title="Credit Total" value={formatStatementMoney(statement.totals.creditTotal)} /></Card>
        <Card><Statistic title="Closing Balance" value={formatStatementMoney(statement.closingBalance)} /></Card>
      </div>
      <Table<ILedgerStatementRow>
        size="small"
        rowKey={(row, index) => `${row.date}-${row.invoiceNo || 'legacy'}-${index}`}
        dataSource={statement.rows || []}
        columns={columns}
        pagination={false}
        scroll={{ x: 1100 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={4}><strong>Totals</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right">{missingValue}</Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="right"><strong>{formatStatementMoney(statement.totals.grossTotal)}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="right"><strong>{formatStatementMoney(statement.totals.debitTotal)}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={7} align="right"><strong>{formatStatementMoney(statement.totals.creditTotal)}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={8} align="right"><strong>{formatStatementMoney(statement.closingBalance)}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );
};

export default LedgerStatementView;