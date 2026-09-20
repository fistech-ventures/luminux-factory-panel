'use client';

import PageHeader from '@base/components/PageHeader';
import LedgerStatementSelector from '@modules/ledger/components/LedgerStatementSelector';
import LedgerStatementView from '@modules/ledger/components/LedgerStatementView';
import { LedgerHooks } from '@modules/ledger/lib/hooks';
import { ILedgerStatementOptions } from '@modules/ledger/lib/interfaces';
import { Button } from 'antd';
import React, { useState } from 'react';
import { FiFileText } from 'react-icons/fi';

const LedgerStatementPage = () => {
  const [isSelectorOpen, setSelectorOpen] = useState(false);
  const [statementOptions, setStatementOptions] = useState<ILedgerStatementOptions>(null);
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
          Select a customer or supplier to view their statement.
        </div>
      )}
      {statementOptions && <LedgerStatementView options={statementOptions} query={statementQuery} />}
      <LedgerStatementSelector
        open={isSelectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSubmit={(options) => {
          setStatementOptions(options);
          setSelectorOpen(false);
        }}
      />
    </React.Fragment>
  );
};

export default LedgerStatementPage;