import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions, Divider, Table, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { SalesHooks } from '../lib/hooks';
import { ISaleItem } from '../lib/interfaces';

interface IProps {
  id: TId;
}

const itemColumns: TableColumnsType<ISaleItem> = [
  {
    key: 'product',
    title: 'Product',
    render: (_, item) => item?.product?.title || 'N/A',
  },
  {
    key: 'productCode',
    title: 'Code',
    render: (_, item) => item?.product?.productCode || 'N/A',
  },
  {
    key: 'variant',
    title: 'Variant',
    render: (_, item) => item?.variant?.title || 'N/A',
  },
  {
    key: 'quantity',
    dataIndex: 'quantity',
    title: 'Quantity',
    render: (quantity) => quantity ?? 0,
  },
  {
    key: 'sellingPrice',
    dataIndex: 'sellingPrice',
    title: 'Selling Price',
    render: (sellingPrice) => (sellingPrice != null ? Number(sellingPrice).toFixed(2) : 'N/A'),
  },
  {
    key: 'totalPrice',
    title: 'Total Price',
    render: (_, item) =>
      (item?.totalPrice != null
        ? Number(item.totalPrice)
        : Number(item?.quantity || 0) * Number(item?.sellingPrice || 0)
      ).toFixed(2),
  },
];

const SalesDetails: React.FC<IProps> = ({ id }) => {
  const query = SalesHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const sale = query.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'date', label: 'Date', children: sale?.date ? dayjs(sale.date).format('YYYY-MM-DD') : 'N/A' },
          { key: 'invoiceNo', label: 'Invoice No', children: sale?.invoiceNo || 'N/A' },
          { key: 'customer', label: 'Customer', children: sale?.customer?.name || 'N/A' },
          {
            key: 'customerContact',
            label: 'Customer Contact',
            children: sale?.customer?.contactNumber || 'N/A',
          },
          { key: 'customerType', label: 'Customer Type', children: sale?.customer?.customerType || 'N/A' },
          { key: 'totalAmount', label: 'Total Amount', children: Number(sale?.totalAmount || 0).toFixed(2) },
          { key: 'discount', label: 'Discount', children: Number(sale?.discount || 0).toFixed(2) },
          { key: 'grandTotal', label: 'Grand Total', children: Number(sale?.grandTotal || 0).toFixed(2) },
          { key: 'paidAmount', label: 'Paid Amount', children: Number(sale?.paidAmount || 0).toFixed(2) },
          { key: 'dueAmount', label: 'Due Amount', children: Number(sale?.dueAmount || 0).toFixed(2) },
          { key: 'paymentMethod', label: 'Payment Method', children: sale?.paymentMethod || 'N/A' },
          { key: 'soldBy', label: 'Sold By', children: sale?.soldBy?.fullName || 'N/A' },
          {
            key: 'createdAt',
            label: 'Created At',
            children: sale?.createdAt ? dayjs(sale.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A',
          },
        ]}
      />
      <Divider orientation="left" plain>
        Items ({sale?.items?.length ?? 0})
      </Divider>
      <Table<ISaleItem>
        size="small"
        rowKey={(item) => String(item?.id ?? item?.productId)}
        dataSource={sale?.items ?? []}
        columns={itemColumns}
        pagination={false}
        scroll={{ x: true }}
      />
    </DetailsBody>
  );
};

export default SalesDetails;
