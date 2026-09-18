import RecordDetailsModal from '@base/components/RecordDetailsModal';
import ActionMenu from '@base/components/ActionMenu';
import { getAccess } from '@modules/auth/lib/utils/client';
import { IPayment } from '@modules/payments/lib/interfaces';
import { Button, Table, TableColumnsType, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';

interface IProps {
  isLoading?: boolean;
  data?: IPayment[];
  pagination?: any;
}

const PaymentsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [detailsRef, setDetailsRef] = useState<{ resource: string; id: string } | null>(null);

  const dataSource = data?.map((payment) => ({
    key: payment?.id,
    paymentDate: payment?.paymentDate,
    amount: payment?.amount,
    entityType: payment?.entityType,
    entityId: payment?.entityId,
    paymentMethod: payment?.paymentMethod,
    referenceType: payment?.referenceType,
    referenceId: payment?.referenceId,
    note: payment?.note,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'paymentDate',
      dataIndex: 'paymentDate',
      title: 'Date',
      render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : 'N/A'),
    },
    {
      key: 'entityType',
      dataIndex: 'entityType',
      title: 'Entity Type',
      render: (type) => (
        <Tag color={type === 'customer' ? 'blue' : 'orange'}>{type === 'customer' ? 'Customer' : 'Supplier'}</Tag>
      ),
    },
    {
      key: 'amount',
      dataIndex: 'amount',
      title: 'Amount',
      render: (amount) => (amount != null ? Number(amount).toFixed(2) : 'N/A'),
    },
    {
      key: 'paymentMethod',
      dataIndex: 'paymentMethod',
      title: 'Payment Method',
      render: (method) => method || 'N/A',
    },
    {
      key: 'referenceType',
      dataIndex: 'referenceType',
      title: 'Reference Type',
      render: (type) => type || 'N/A',
    },
    {
      key: 'reference',
      dataIndex: 'referenceId',
      title: 'Reference ID',
      render: (id) => id || 'N/A',
    },
    {
      key: 'note',
      dataIndex: 'note',
      title: 'Note',
      render: (note) => note || 'N/A',
    },
    {
      key: 'action',
      dataIndex: 'referenceId',
      title: 'Action',
      align: 'center',
      render: (referenceId, record) => {
        // A payment can point at a sale/purchase (reference) or at a customer/supplier (entity).
        const resource = record?.referenceType || record?.entityType;
        const id = referenceId || record?.entityId;

        if (!resource || !id) return 'N/A';

        return (
          <ActionMenu content={<Button
            title="View details"
            icon={<AiOutlineEye />}
            onClick={() => {
              getAccess(['payments:read'], () => {
                setDetailsRef({ resource, id: String(id) });
              });
            }}
          />} />
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Table
        loading={isLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        scroll={{ x: true }}
      />
      <RecordDetailsModal
        open={!!detailsRef?.id}
        onClose={() => setDetailsRef(null)}
        resource={detailsRef?.resource}
        id={detailsRef?.id}
      />
    </React.Fragment>
  );
};

export default PaymentsList;
