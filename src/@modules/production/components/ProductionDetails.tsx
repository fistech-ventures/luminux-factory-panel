import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { ProductionHooks } from '../lib/hooks';
import { IProductionRawMaterial } from '../lib/interfaces';

interface IProps {
  id: TId;
}

const ProductionDetails: React.FC<IProps> = ({ id }) => {
  const query = ProductionHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const production = query.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'product', label: 'Finished Product', children: production?.product?.title || 'N/A' },
          { key: 'productCode', label: 'Product Code', children: production?.product?.productCode || 'N/A' },
          {
            key: 'status',
            label: 'Status',
            children: (
              <Tag color={production?.status === 'pending' ? 'gold' : 'green'}>
                {production?.status === 'pending' ? 'Pending' : 'Approved'}
              </Tag>
            ),
          },
          { key: 'type', label: 'Type', children: production?.isNewProduct ? 'New product' : 'Existing product' },
          { key: 'quantity', label: 'Quantity Produced', children: production?.quantity ?? 0 },
          { key: 'otherCost', label: 'Other Cost', children: Number(production?.otherCost ?? 0).toFixed(2) },
          {
            key: 'totalProductionCost',
            label: 'Production Cost',
            children: Number(production?.totalProductionCost ?? 0).toFixed(2),
          },
          {
            key: 'productionCostPerUnit',
            label: 'Cost per Unit',
            children: Number(production?.productionCostPerUnit ?? 0).toFixed(2),
          },
          {
            key: 'createdAt',
            label: 'Created At',
            children: production?.createdAt ? dayjs(production.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A',
          },
        ]}
      />
      <Table<IProductionRawMaterial>
        className="mt-6"
        size="small"
        rowKey={(item) => `${item.rawMaterialId}-${item.rawMaterialCombinationId ?? 'standard'}`}
        dataSource={production?.usedRawMaterials ?? []}
        pagination={false}
        scroll={{ x: true }}
        columns={[
          { title: 'Material', dataIndex: 'title' },
          { title: 'Combination', dataIndex: 'combinationTitle', render: (value) => value || 'Standard' },
          { title: 'Quantity', dataIndex: 'quantity' },
          { title: 'Unit', dataIndex: 'unit', render: (value) => value || 'N/A' },
          { title: 'Sourcing Price', dataIndex: 'sourcingPrice', render: (value) => Number(value ?? 0).toFixed(2) },
          { title: 'Total Cost', dataIndex: 'totalCost', render: (value) => Number(value ?? 0).toFixed(2) },
        ]}
      />
    </DetailsBody>
  );
};

export default ProductionDetails;