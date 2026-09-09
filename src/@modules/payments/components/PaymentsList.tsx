import { IPayment } from '@modules/payments/lib/interfaces';
import { Table, TableColumnsType, Tag } from 'antd';
import dayjs from 'dayjs';

interface IProps {
  isLoading?: boolean;
  data?: IPayment[];
  pagination?: any;
}

const PaymentsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
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
        <Tag color={type === 'customer' ? 'blue' : 'orange'}>
          {type === 'customer' ? 'Customer' : 'Supplier'}
        </Tag>
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
      key: 'referenceId',
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
  ];

  return (
    <Table
      loading={isLoading}
      dataSource={dataSource}
      columns={columns}
      pagination={pagination}
      scroll={{ x: true }}
    />
  );
};

export default PaymentsList;
