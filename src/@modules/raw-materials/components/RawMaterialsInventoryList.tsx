import { IRawMaterial } from '@modules/raw-materials/lib/interfaces';
import { Table, TableColumnsType } from 'antd';

interface ICombinationInventoryRow {
  key: string;
  combination: string;
  code?: string;
  unit?: string;
  stock: number;
  saleQuantity: number;
}

interface IProps {
  isLoading: boolean;
  data?: IRawMaterial[];
  pagination: any;
}

const getCombinationRows = (rawMaterial: IRawMaterial): ICombinationInventoryRow[] => {
  const combinations = (rawMaterial.combinations ?? [])
    .filter((combination) => Number(combination.stock) > 0)
    .map((combination) => ({
      key: String(combination.id ?? combination.title),
      combination: combination.title,
      code: combination.code,
      unit: combination.unit || rawMaterial.unit,
      stock: Number(combination.stock),
      saleQuantity: Number(combination.saleQuantity ?? 0),
    }));

  return combinations.length
    ? combinations
    : [
        {
          key: String(rawMaterial.id ?? rawMaterial.title),
          combination: 'Standard',
          unit: rawMaterial.unit,
          stock: Number(rawMaterial.stock ?? 0),
          saleQuantity: Number(rawMaterial.saleQuantity ?? 0),
        },
      ];
};

const combinationColumns: TableColumnsType<ICombinationInventoryRow> = [
  { key: 'combination', dataIndex: 'combination', title: 'Combination' },
  { key: 'code', dataIndex: 'code', title: 'Code', render: (code) => code || 'N/A' },
  { key: 'unit', dataIndex: 'unit', title: 'Unit', render: (unit) => unit || 'N/A' },
  { key: 'stock', dataIndex: 'stock', title: 'In stock', align: 'right' },
  { key: 'saleQuantity', dataIndex: 'saleQuantity', title: 'Sold', align: 'right' },
];

const RawMaterialsInventoryList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const columns: TableColumnsType<IRawMaterial> = [
    { key: 'title', dataIndex: 'title', title: 'Raw material' },
    { key: 'unit', dataIndex: 'unit', title: 'Unit', render: (unit) => unit || 'N/A' },
    {
      key: 'combinations',
      dataIndex: 'combinations',
      title: 'Combinations',
      render: (combinations) => combinations?.length ?? 0,
    },
    { key: 'stock', dataIndex: 'stock', title: 'Total in stock', align: 'right' },
    { key: 'saleQuantity', dataIndex: 'saleQuantity', title: 'Sold', align: 'right' },
  ];

  return (
    <Table<IRawMaterial>
      loading={isLoading}
      dataSource={data}
      rowKey="id"
      columns={columns}
      pagination={pagination}
      scroll={{ x: true }}
      expandable={{
        expandedRowRender: (rawMaterial) => (
          <Table<ICombinationInventoryRow>
            rowKey="key"
            columns={combinationColumns}
            dataSource={getCombinationRows(rawMaterial)}
            pagination={false}
            size="small"
            scroll={{ x: true }}
          />
        ),
      }}
    />
  );
};

export default RawMaterialsInventoryList;