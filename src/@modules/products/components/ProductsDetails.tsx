import DetailsBody from "@base/components/DetailsBody";
import { TId } from "@base/interfaces";
import { Descriptions, Divider, Table, TableColumnsType } from "antd";
import dayjs from "dayjs";
import React from "react";
import { ProductsHooks } from "../lib/hooks";
import { IProductVariantLink, IProductVariantSku } from "../lib/interfaces";

interface IProps {
  id: TId;
}

type TProductVariant = IProductVariantLink & {
  variant?: { id: TId; title: string };
  variantOption?: { id: TId; title: string };
};

const variantColumns: TableColumnsType<TProductVariant> = [
  {
    key: "variant",
    title: "Variant",
    render: (_, variant) => variant?.variant?.title || "N/A",
  },
  {
    key: "variantOption",
    title: "Option",
    render: (_, variant) => variant?.variantOption?.title || "N/A",
  },
  { key: "sku", dataIndex: "sku", title: "SKU", render: (sku) => sku || "N/A" },
  {
    key: "sellingPrice",
    dataIndex: "sellingPrice",
    title: "Selling Price",
    render: (sellingPrice) =>
      sellingPrice != null ? Number(sellingPrice).toFixed(2) : "N/A",
  },
  {
    key: "stockQuantity",
    dataIndex: "stockQuantity",
    title: "Stock",
    render: (stockQuantity) => stockQuantity ?? 0,
  },
];

const skuColumns: TableColumnsType<IProductVariantSku> = [
  {
    key: "values",
    title: "Combination",
    render: (_, sku) =>
      (sku.values ?? [])
        .map(
          (value) => `${value.variant?.title}: ${value.variantOption?.title}`,
        )
        .join(" / ") || "N/A",
  },
  { key: "productCode", dataIndex: "productCode", title: "SKU" },
  // {
  //   key: "sourcingPrice",
  //   dataIndex: "sourcingPrice",
  //   title: "Cost",
  //   render: (value) => Number(value ?? 0).toFixed(2),
  // },
  {
    key: "sellingPrice",
    dataIndex: "sellingPrice",
    title: "Selling Price",
    render: (value) => Number(value ?? 0).toFixed(2),
  },
  { key: "stockQuantity", dataIndex: "stockQuantity", title: "Stock" },
];

const ProductsDetails: React.FC<IProps> = ({ id }) => {
  const query = ProductsHooks.useFindById({
    id,
    config: { queryKey: [], enabled: !!id },
  });
  const product = query.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: "title", label: "Title", children: product?.title || "N/A" },
          {
            key: "productCode",
            label: "Product Code",
            children: product?.productCode || "N/A",
          },
          {
            key: "sourcingPrice",
            label: "Sourcing Price",
            children: Number(product?.sourcingPrice || 0).toFixed(2),
          },
          {
            key: "sellingPrice",
            label: "Selling Price",
            children: Number(product?.sellingPrice || 0).toFixed(2),
          },
          { key: "stock", label: "Stock", children: product?.stock ?? 0 },
          {
            key: "saleQuantity",
            label: "Sold Quantity",
            children: product?.saleQuantity ?? 0,
          },
          {
            key: "averageB2BSalesPrice",
            label: "Avg B2B Price",
            children: Number(product?.averageB2BSalesPrice || 0).toFixed(2),
          },
          {
            key: "averageB2CSalesPrice",
            label: "Avg B2C Price",
            children: Number(product?.averageB2CSalesPrice || 0).toFixed(2),
          },
          {
            key: "b2bSoldQuantity",
            label: "B2B Sold",
            children: product?.b2bSoldQuantity ?? 0,
          },
          {
            key: "b2cSoldQuantity",
            label: "B2C Sold",
            children: product?.b2cSoldQuantity ?? 0,
          },
          {
            key: "createdAt",
            label: "Created At",
            children: product?.createdAt
              ? dayjs(product.createdAt).format("YYYY-MM-DD HH:mm")
              : "N/A",
          },
          {
            key: "warranty",
            label: "Warranty",
            span: 2,
            children: product?.warranty || "N/A",
          },
        ]}
      />
      {(product?.skus?.length ?? 0) > 0 && (
        <>
          <Divider orientation="left" plain>
            Sellable combinations ({product?.skus?.length ?? 0})
          </Divider>
          <Table<IProductVariantSku>
            size="small"
            rowKey={(sku) => String(sku.id ?? sku.productCode)}
            dataSource={product?.skus ?? []}
            columns={skuColumns}
            pagination={false}
            scroll={{ x: true }}
          />
        </>
      )}
      <Divider orientation="left" plain>
        Variants ({product?.variants?.length ?? 0})
      </Divider>
      <Table<TProductVariant>
        size="small"
        rowKey={(variant) => String(variant?.id ?? variant?.variantId)}
        dataSource={product?.variants ?? []}
        columns={variantColumns}
        pagination={false}
        scroll={{ x: true }}
      />
    </DetailsBody>
  );
};

export default ProductsDetails;
