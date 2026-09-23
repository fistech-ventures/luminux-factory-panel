'use client';

import BrandLogo from '@base/components/BrandLogo';
import { SettingsHooks } from '@modules/settings/lib/hooks';
import {
  formatStatementDate,
  formatStatementMoney,
  formatStatementQty,
} from '@modules/ledger/components/LedgerStatementView';
import { LedgerHooks } from '@modules/ledger/lib/hooks';
import { ILedgerStatementOptions } from '@modules/ledger/lib/interfaces';
import { Alert, Button, Spin, Tag } from 'antd';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

const PrintStatementPage = () => {
  const searchParams = useSearchParams();
  const printedRef = useRef(false);
  const options: ILedgerStatementOptions = {
    entityType: searchParams.get('entityType') as ILedgerStatementOptions['entityType'],
    entityId: searchParams.get('entityId'),
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  };
  const statementQuery = LedgerHooks.useGetStatement({ options, config: { queryKey: [] } });
  const settingsQuery = SettingsHooks.useFindQuick({ config: { queryKey: [] } });
  const statement = statementQuery.data?.data;

  useEffect(() => {
    if (!statementQuery.isLoading && statement && !printedRef.current) {
      printedRef.current = true;
      const timeout = window.setTimeout(() => window.print(), 250);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [statementQuery.isLoading, statement]);

  if (!options.entityType || !options.entityId) {
    return <main className="mx-auto max-w-4xl p-8"><Alert type="error" message="Statement parameters are missing." /></main>;
  }

  if (statementQuery.isLoading) return <main className="flex min-h-screen items-center justify-center"><Spin /></main>;
  if (statementQuery.error) return <main className="mx-auto max-w-4xl p-8"><Alert type="error" message="Unable to load the statement." /></main>;
  if (!statement) return <main className="mx-auto max-w-4xl p-8"><Alert type="warning" message="No statement found." /></main>;

  return (
    <main className="statement-print mx-auto max-w-6xl p-8 text-sm text-black">
      <div className="no-print mb-4 flex justify-end">
        <Button type="primary" onClick={() => window.print()}>Print</Button>
      </div>
      <header className="mb-6 flex items-start justify-between gap-8 border-b pb-4">
        <div className="h-16 w-40"><BrandLogo isBrand height={64} /></div>
        <div className="text-right">
          <h1 className="text-xl font-bold">{settingsQuery.data?.data?.name || 'Business Statement'}</h1>
          <p>{settingsQuery.data?.data?.address || ''}</p>
          <p>{settingsQuery.data?.data?.phone || ''}</p>
        </div>
      </header>
      <h2 className="mb-4 text-lg font-bold">Statement of Account - {statement.party.name || statement.party.companyName}</h2>
      <section className="mb-5 flex justify-between gap-6 border-b pb-4">
        <div>
          {statement.party.customerType && <Tag>{statement.party.customerType}</Tag>}
          {statement.party.employeeId && <Tag color="green">{statement.party.employeeId}</Tag>}
          <p>{statement.party.contactNumber || statement.party.phoneNumber || '—'}</p>
          {statement.party.email && <p>{statement.party.email}</p>}
          {statement.party.designation && <p>{statement.party.designation}</p>}
          {statement.party.address && <p>{statement.party.address}</p>}
        </div>
        <p>
          {statement.startDate && statement.endDate
            ? `${formatStatementDate(statement.startDate)} - ${formatStatementDate(statement.endDate)}`
            : 'All time'}
        </p>
      </section>
      <section className="mb-5 grid grid-cols-5 gap-3">
        <Summary label="Opening Balance" value={statement.openingBalance} />
        <Summary label="Gross Total" value={statement.totals.grossTotal} />
        <Summary label="Debit Total" value={statement.totals.debitTotal} />
        <Summary label="Credit Total" value={statement.totals.creditTotal} />
        <Summary label="Closing Balance" value={statement.closingBalance} emphasized />
      </section>
      <table className="statement-table w-full border-collapse">
        <thead>
          <tr>
            {['Date', 'Particulars', 'Narration', 'Invoice No.', 'Qty', 'Gross', 'Debit', 'Credit', 'Balance'].map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {statement.rows.map((row, index) => (
            <tr key={`${row.date}-${row.invoiceNo || 'legacy'}-${index}`}>
              <td>{formatStatementDate(row.date)}</td>
              <td>{row.particulars || '—'}</td>
              <td className="narration">{row.narration || '—'}</td>
              <td>{row.invoiceNo || '—'}</td>
              <td className="number">{formatStatementQty(row.qty)}</td>
              <td className="number">{formatStatementMoney(row.gross)}</td>
              <td className="number">{formatStatementMoney(row.debit)}</td>
              <td className="number">{formatStatementMoney(row.credit)}</td>
              <td className="number">{formatStatementMoney(row.balance)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4}>Totals</th>
            <th className="number">—</th>
            <th className="number">{formatStatementMoney(statement.totals.grossTotal)}</th>
            <th className="number">{formatStatementMoney(statement.totals.debitTotal)}</th>
            <th className="number">{formatStatementMoney(statement.totals.creditTotal)}</th>
            <th className="number">{formatStatementMoney(statement.closingBalance)}</th>
          </tr>
        </tfoot>
      </table>
      <style jsx>{`
        .statement-table th, .statement-table td { border: 1px solid #d9d9d9; padding: 6px 8px; text-align: left; vertical-align: top; }
        .statement-table th, .statement-table tfoot th { font-weight: 700; }
        .statement-table .number { text-align: right; white-space: nowrap; }
        .statement-table .narration { white-space: normal; min-width: 180px; }
        @media print {
          @page { margin: 12mm; }
          .no-print { display: none; }
          :global(body) { background: transparent !important; }
          .statement-print { max-width: none; padding: 0; font-size: 10px; }
          thead { display: table-header-group; }
          tr { break-inside: avoid; }
        }
      `}</style>
    </main>
  );
};

const Summary: React.FC<{ label: string; value: number; emphasized?: boolean }> = ({ label, value, emphasized }) => (
  <div className={emphasized ? 'border border-black p-2' : 'p-2'}>
    <div className="text-xs">{label}</div>
    <strong>{formatStatementMoney(value)}</strong>
  </div>
);

export default PrintStatementPage;