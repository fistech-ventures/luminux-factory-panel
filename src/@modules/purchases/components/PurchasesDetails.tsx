import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions, Divider, Table, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { PurchasesHooks } from '../lib/hooks';
import { IPurchaseItem } from '../lib/interfaces';

interface IProps {
  id: TId;
}

const itemColumns: TableColumnsType<IPurchaseItem> = [
  {
    key: 'product',
    title: 'Product',
    render: (_, item) => item?.product?.title || item?.productName || 'N/A',
  },
  {
    key: 'productCode',
    title: 'Code',
    render: (_, item) => item?.product?.productCode || item?.productCode || 'N/A',
  },
  {
    key: 'quantity',
    dataIndex: 'quantity',
    title: 'Quantity',
    render: (quantity) => quantity ?? 0,
  },
  {
    key: 'totalProductCost',
    dataIndex: 'totalProductCost',
    title: 'Product Cost',
    render: (totalProductCost) => (totalProductCost != null ? Number(totalProductCost).toFixed(2) : 'N/A'),
  },
  {
    key: 'otherCost',
    dataIndex: 'otherCost',
    title: 'Other Cost',
    render: (otherCost) => (otherCost != null ? Number(otherCost).toFixed(2) : 'N/A'),
  },
  {
    key: 'totalCost',
    title: 'Total Cost',
    render: (_, item) => (Number(item?.totalProductCost || 0) + Number(item?.otherCost || 0)).toFixed(2),
  },
];

const PurchasesDetails: React.FC<IProps> = ({ id }) => {
  const query = PurchasesHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const purchase = query.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          {
            key: 'purchaseDate',
            label: 'Purchase Date',
            children: purchase?.purchaseDate ? dayjs(purchase.purchaseDate).format('YYYY-MM-DD') : 'N/A',
          },
          { key: 'purchaseType', label: 'Purchase Type', children: purchase?.purchaseType || 'N/A' },
          { key: 'supplier', label: 'Supplier', children: purchase?.supplier?.companyName || 'N/A' },
          {
            key: 'supplierContact',
            label: 'Supplier Contact',
            children: purchase?.supplier?.contactNumber || 'N/A',
          },
          { key: 'totalQuantity', label: 'Total Quantity', children: purchase?.totalQuantity ?? 0 },
          {
            key: 'totalPurchaseAmount',
            label: 'Total Purchase Amount',
            children: Number(purchase?.totalPurchaseAmount || 0).toFixed(2),
          },
          { key: 'paidAmount', label: 'Paid Amount', children: Number(purchase?.paidAmount || 0).toFixed(2) },
          { key: 'dueAmount', label: 'Due Amount', children: Number(purchase?.dueAmount || 0).toFixed(2) },
          { key: 'paymentMethod', label: 'Payment Method', children: purchase?.paymentMethod || 'N/A' },
          { key: 'purchasedBy', label: 'Purchased By', children: purchase?.purchasedBy?.phoneNumber || 'N/A' },
          { key: 'createdBy', label: 'Created By', children: purchase?.createdBy?.fullName || 'N/A' },
          {
            key: 'createdAt',
            label: 'Created At',
            children: purchase?.createdAt ? dayjs(purchase.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A',
          },
        ]}
      />
      <Divider orientation="left" plain>
        Items ({purchase?.items?.length ?? 0})
      </Divider>
      <Table<IPurchaseItem>
        size="small"
        rowKey={(item) => String(item?.id ?? item?.productId ?? item?.productName)}
        dataSource={purchase?.items ?? []}
        columns={itemColumns}
        pagination={false}
        scroll={{ x: true }}
      />
    </DetailsBody>
  );
};

export default PurchasesDetails;
