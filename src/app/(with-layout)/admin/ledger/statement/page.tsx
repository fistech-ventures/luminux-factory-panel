'use client';

import PageHeader from '@base/components/PageHeader';
import LedgerStatementSelector from '@modules/ledger/components/LedgerStatementSelector';
import LedgerStatementView from '@modules/ledger/components/LedgerStatementView';
import { LedgerHooks } from '@modules/ledger/lib/hooks';
import { ILedgerStatementOptions } from '@modules/ledger/lib/interfaces';
import { Button } from 'antd';
import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { FiFileText } from 'react-icons/fi';

const LedgerStatementPage = () => {
  const searchParams = useSearchParams();
  const [isSelectorOpen, setSelectorOpen] = useState(false);

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
