import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Button, Descriptions } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { PaymentsHooks } from '../lib/hooks';

interface IProps {
  id: TId;
  /** Opens the referenced record (sale/purchase/customer/supplier) in a nested popup. */
  onViewReference?: (resource: string, id: TId) => void;
}

const PaymentsDetails: React.FC<IProps> = ({ id, onViewReference }) => {
  const query = PaymentsHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const payment = query.data?.data;

  // Payments can point at a sale/purchase (reference) or at a customer/supplier (entity).
  const referenceType = payment?.referenceType || payment?.entityType;
  const referenceId = payment?.referenceId || payment?.entityId;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          {
            key: 'paymentDate',
            label: 'Payment Date',
            children: payment?.paymentDate ? dayjs(payment.paymentDate).format('YYYY-MM-DD') : 'N/A',
          },
          { key: 'amount', label: 'Amount', children: Number(payment?.amount || 0).toFixed(2) },
          { key: 'paymentMethod', label: 'Payment Method', children: payment?.paymentMethod || 'N/A' },
          { key: 'entityType', label: 'Entity Type', children: payment?.entityType || 'N/A' },
          { key: 'entityId', label: 'Entity ID', children: payment?.entityId || 'N/A' },
          { key: 'referenceType', label: 'Reference Type', children: payment?.referenceType || 'N/A' },
          {
            key: 'referenceId',
            label: 'Reference ID',
            children: (
              <div className="flex items-center gap-2">
                <span>{payment?.referenceId || 'N/A'}</span>
                {!!referenceType && !!referenceId && !!onViewReference && (
                  <Button
                    size="small"
                    type="link"
                    icon={<FiExternalLink />}
                    onClick={() => onViewReference(referenceType, referenceId)}
                  >
                    View {referenceType}
                  </Button>
                )}
              </div>
            ),
          },
          { key: 'note', label: 'Note', children: payment?.note || 'N/A' },
          {
            key: 'createdAt',
            label: 'Created At',
            children: payment?.createdAt ? dayjs(payment.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A',
          },
        ]}
      />
    </DetailsBody>
  );
};

export default PaymentsDetails;
