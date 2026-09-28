'use client';

import PageHeader from '@base/components/PageHeader';
import LedgerStatementSelector from '@modules/ledger/components/LedgerStatementSelector';
import LedgerStatementView from '@modules/ledger/components/LedgerStatementView';
import { LedgerHooks } from '@modules/ledger/lib/hooks';
import { ILedgerStatementOptions } from '@modules/ledger/lib/interfaces';
import { Button, Statistic } from 'antd';
import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { FiFileText } from 'react-icons/fi';

const LedgerStatementPage = () => {
  const searchParams = useSearchParams();
  const [isSelectorOpen, setSelectorOpen] = useState(false);
  const balanceSummaryQuery = LedgerHooks.useGetBalanceSummary();

  // Supports deep-links, e.g. ?entityType=employee&entityId=<uuid>&startDate=…&endDate=…
  const initialOptions = useMemo<ILedgerStatementOptions>(() => {
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) return null;

    return {
      entityType: entityType as ILedgerStatementOptions['entityType'],
      entityId,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };
  }, [searchParams]);

  const [statementOptions, setStatementOptions] = useState<ILedgerStatementOptions>(initialOptions);
  const statementQuery = LedgerHooks.useGetStatement({
    options: statementOptions,
    config: { queryKey: [] },
  });

  return (
    <React.Fragment>
      <PageHeader
        title="Ledger Statements"
        extra={
          <Button type="primary" icon={<FiFileText />} onClick={() => setSelectorOpen(true)}>
            New Statement
          </Button>
        }
      />
      {balanceSummaryQuery.data?.data && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white dark:bg-(--color-rich-black) border border-gray-200 rounded-lg p-4">
            <Statistic title="Customer Due" value={balanceSummaryQuery.data.data.customerDue} precision={2} />
          </div>
          <div className="bg-white dark:bg-(--color-rich-black) border border-gray-200 rounded-lg p-4">
            <Statistic title="Supplier Due" value={balanceSummaryQuery.data.data.supplierDue} precision={2} />
          </div>
        </div>
      )}
      {!statementOptions && (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-gray-500">
          Select a customer, supplier or employee to view their statement.
        </div>
      )}
      {statementOptions && <LedgerStatementView options={statementOptions} query={statementQuery} />}
      <LedgerStatementSelector
        open={isSelectorOpen}
        onClose={() => setSelectorOpen(false)}
        initialValues={statementOptions || undefined}
        onSubmit={(options) => {
          setStatementOptions(options);
          setSelectorOpen(false);
        }}
      />
    </React.Fragment>
  );
};

export default LedgerStatementPage;
