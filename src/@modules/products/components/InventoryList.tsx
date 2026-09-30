import { IProduct } from "@modules/products/lib/interfaces";
import { Table, TableColumnsType } from "antd";

interface ICombinationRow {
  key: string;
  combination: string;
  productCode?: string;
  stockQuantity: number;
}

interface IProps {
  isLoading: boolean;
  data?: IProduct[];
  pagination: any;
}

const getCombinationRows = (product: IProduct): ICombinationRow[] => {
  const variantRows = (product.variants ?? [])
    .filter((variant) => Number(variant.stockQuantity) > 0)
    .map((variant) => ({
      key:
        variant.id?.toString() ??
        `${variant.variantId}-${variant.variantOptionId}`,
      combination: [variant.variant?.title, variant.variantOption?.title]
        .filter(Boolean)
        .join(": "),
      productCode: variant.sku,
      stockQuantity: Number(variant.stockQuantity),
    }));

  const skuRows = (product.skus ?? [])
    .filter((sku) => Number(sku.stockQuantity) > 0)
    .map((sku) => ({
      key: sku.id?.toString() ?? sku.productCode,
      combination:
        sku.name ||
        (sku.values ?? [])
          .map((value) =>
            [value.variant?.title, value.variantOption?.title]
              .filter(Boolean)
              .join(": "),
          )
          .filter(Boolean)
          .join(" / ") ||
        "Combination",
      productCode: sku.productCode,
      stockQuantity: Number(sku.stockQuantity),
    }));

  const combinations = [...variantRows, ...skuRows];
  return combinations.length
    ? combinations
    : [
        {
          key: product.id.toString(),
          combination: "Standard",
          productCode: product.productCode,
          stockQuantity: Number(product.stock),
        },
      ];
};

const combinationColumns: TableColumnsType<ICombinationRow> = [
  { key: "combination", dataIndex: "combination", title: "Combination" },
  {
    key: "productCode",
    dataIndex: "productCode",
    title: "SKU",
    render: (value) => value || "N/A",
  },
  {
    key: "stockQuantity",
    dataIndex: "stockQuantity",
    title: "In stock",
    align: "right",
  },
];

const InventoryList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const columns: TableColumnsType<IProduct> = [
    { key: "title", dataIndex: "title", title: "Product" },
    { key: "productCode", dataIndex: "productCode", title: "Product code" },
    {
      key: "unit",
      dataIndex: "unit",
      title: "Unit",
      render: (unit) => unit || "N/A",
    },
    {
      key: "stock",
      dataIndex: "stock",
      title: "Total in stock",
      align: "right",
    },
  ];

  return (
    <Table<IProduct>
      loading={isLoading}
      dataSource={data}
      rowKey="id"
      columns={columns}
      pagination={pagination}
      scroll={{ x: true }}
      expandable={{
        expandedRowRender: (product) => (
          <Table<ICombinationRow>
            rowKey="key"
            columns={combinationColumns}
            dataSource={getCombinationRows(product)}
            pagination={false}
            size="small"
          />
        ),
      }}
    />
  );
};

export default InventoryList;
