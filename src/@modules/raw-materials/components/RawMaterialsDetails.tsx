import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions, Divider, Image, Table, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { RawMaterialsHooks } from '../lib/hooks';
import { IRawMaterialCombination } from '../lib/interfaces';

interface IProps {
  id: TId;
}

const combinationColumns: TableColumnsType<IRawMaterialCombination> = [
  { key: 'title', dataIndex: 'title', title: 'Combination' },
  { key: 'code', dataIndex: 'code', title: 'Code', render: (code) => code || 'N/A' },
  { key: 'unit', dataIndex: 'unit', title: 'Unit', render: (unit) => unit || 'N/A' },
  {
    key: 'sourcingPrice',
    dataIndex: 'sourcingPrice',
    title: 'Sourcing Price',
    render: (price) => Number(price ?? 0).toFixed(2),
  },
  {
    key: 'sellingPrice',
    dataIndex: 'sellingPrice',
    title: 'Selling Price',
    render: (price) => Number(price ?? 0).toFixed(2),
  },
  { key: 'stock', dataIndex: 'stock', title: 'Stock', align: 'right' },
  {
    key: 'saleQuantity',
    dataIndex: 'saleQuantity',
    title: 'Sold',
    align: 'right',
    render: (quantity) => quantity ?? 0,
  },
];

const RawMaterialsDetails: React.FC<IProps> = ({ id }) => {
  const query = RawMaterialsHooks.useFindById({
    id,
    config: { queryKey: [], enabled: !!id },
  });
  const rawMaterial = query.data?.data;
  const combinations = rawMaterial?.combinations ?? [];
  const hasCombinations = combinations.length > 0;

  const items = [
    { key: 'title', label: 'Title', children: rawMaterial?.title || 'N/A' },
    { key: 'unit', label: 'Unit', children: rawMaterial?.unit || 'N/A' },
    { key: 'warranty', label: 'Warranty', children: rawMaterial?.warranty || 'N/A' },
    { key: 'stock', label: 'Stock', children: rawMaterial?.stock ?? 0 },
    { key: 'saleQuantity', label: 'Sold Quantity', children: rawMaterial?.saleQuantity ?? 0 },
    ...(hasCombinations
      ? []
      : [
          {
            key: 'sourcingPrice',
            label: 'Sourcing Price',
            children: Number(rawMaterial?.sourcingPrice ?? 0).toFixed(2),
          },
          {
            key: 'sellingPrice',
            label: 'Selling Price',
            children: Number(rawMaterial?.sellingPrice ?? 0).toFixed(2),
          },
        ]),
    {
      key: 'description',
      label: 'Description',
      span: 2,
      children: rawMaterial?.description || 'N/A',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      children: rawMaterial?.createdAt
        ? dayjs(rawMaterial.createdAt).format('DD/MM/YYYY HH:mm')
        : 'N/A',
    },
  ];

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} items={items} />
      {hasCombinations && (
        <>
          <Divider orientation="left" plain>
            Combinations ({combinations.length})
          </Divider>
          <Table<IRawMaterialCombination>
            rowKey={(combination) => String(combination.id ?? combination.title)}
            size="small"
            dataSource={combinations}
            columns={combinationColumns}
            pagination={false}
            scroll={{ x: true }}
          />
        </>
      )}
    </DetailsBody>
  );
};

export default RawMaterialsDetails;