import { IProfitEntry } from '@modules/profit/lib/interfaces';
import { Table, TableColumnsType, Tag } from 'antd';
import dayjs from 'dayjs';

interface IProps {
  isLoading?: boolean;
  data?: IProfitEntry[];
  pagination?: any;
}

const ProfitList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const dataSource = data?.map((profit) => ({
    key: profit?.id,
    invoiceNo: profit?.invoiceNo,
    date: profit?.date,
    revenue: profit?.revenue,
    totalCost: profit?.totalCost,
    profit: profit?.profit,
    paymentMethod: profit?.paymentMethod,
    customerName: profit?.customerName,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'invoiceNo',
      dataIndex: 'invoiceNo',
      title: 'Invoice',
      render: (invoiceNo) => invoiceNo || 'N/A',
    },
    {
      key: 'date',
      dataIndex: 'date',
      title: 'Date',
      render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : 'N/A'),
    },
    {
      key: 'customerName',
      dataIndex: 'customerName',
      title: 'Customer',
      render: (customerName) => customerName || 'N/A',
    },
    {
      key: 'revenue',
      dataIndex: 'revenue',
      title: 'Revenue',
      render: (revenue) => (revenue != null ? Number(revenue).toFixed(2) : 'N/A'),
    },
    {
      key: 'totalCost',
      dataIndex: 'totalCost',
      title: 'Cost',
      render: (totalCost) => (totalCost != null ? Number(totalCost).toFixed(2) : 'N/A'),
    },
    {
      key: 'profit',
      dataIndex: 'profit',
      title: 'Profit',
      render: (profit) => (
        <Tag color={profit > 0 ? 'green' : 'red'}>
          {profit != null ? Number(profit).toFixed(2) : 'N/A'}
        </Tag>
      ),
    },
    {
      key: 'paymentMethod',
      dataIndex: 'paymentMethod',
      title: 'Payment Method',
      render: (paymentMethod) => paymentMethod || 'N/A',
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

export default ProfitList;
