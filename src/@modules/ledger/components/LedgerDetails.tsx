import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Button, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { LedgerHooks } from '../lib/hooks';

interface IProps {
  id: TId;
  /** Opens the referenced record (sale/purchase/expense/payment) in a nested popup. */
  onViewReference?: (resource: string, id: TId) => void;
}

const LedgerDetails: React.FC<IProps> = ({ id, onViewReference }) => {
  const query = LedgerHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const ledger = query.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          {
            key: 'transactionDate',
            label: 'Transaction Date',
            children: ledger?.transactionDate ? dayjs(ledger.transactionDate).format('YYYY-MM-DD HH:mm') : 'N/A',
          },
          {
            key: 'entityType',
            label: 'Entity Type',
            children: ledger?.entityType ? (
              <Tag color={ledger.entityType === 'supplier' ? 'geekblue' : 'purple'}>{ledger.entityType}</Tag>
            ) : (
              'N/A'
            ),
          },
          { key: 'entityId', label: 'Entity ID', children: ledger?.entityId || 'N/A' },
          {
            key: 'type',
            label: 'Type',
            children: ledger?.type ? <Tag color={ledger.type === 'paid' ? 'green' : 'orange'}>{ledger.type}</Tag> : 'N/A',
          },
          { key: 'amount', label: 'Amount', children: Number(ledger?.amount || 0).toFixed(2) },
          { key: 'referenceType', label: 'Reference Type', children: ledger?.referenceType || 'N/A' },
          {
            key: 'referenceId',
            label: 'Reference ID',
            children: (
              <div className="flex items-center gap-2">
                <span>{ledger?.referenceId || 'N/A'}</span>
                {!!ledger?.referenceType && !!ledger?.referenceId && !!onViewReference && (
                  <Button
                    size="small"
                    type="link"
                    icon={<FiExternalLink />}
                    onClick={() => onViewReference(ledger.referenceType, ledger.referenceId)}
                  >
                    View {ledger.referenceType}
                  </Button>
                )}
              </div>
            ),
          },
          { key: 'description', label: 'Description', span: 2, children: ledger?.description || 'N/A' },
          {
            key: 'createdAt',
            label: 'Created At',
            children: ledger?.createdAt ? dayjs(ledger.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A',
          },
        ]}
      />
    </DetailsBody>
  );
};

export default LedgerDetails;
