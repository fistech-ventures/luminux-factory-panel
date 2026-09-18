import ConfirmationDialog from "@base/components/ConfirmationDialog";
import ActionMenu from "@base/components/ActionMenu";
import RecordDetailsModal from "@base/components/RecordDetailsModal";
import { ImagePaths } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import { getAccess } from "@modules/auth/lib/utils/client";
import type { PaginationProps, TableColumnsType } from "antd";
import { Button, Drawer, Form, Image, Table, message } from "antd";
import React, { useState } from "react";
import { AiFillEdit, AiFillDelete, AiOutlineEye } from "react-icons/ai";
import { ProductsHooks } from "../lib/hooks";
import { IProduct } from "../lib/interfaces";
import ProductsForm from "./ProductsForm";

interface IProps {
  isLoading: boolean;
  data: IProduct[];
  pagination: PaginationProps;
}

const ProductsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IProduct>(null);
  const [detailsItem, setDetailsItem] = useState<IProduct>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: "", content: "", onConfirm: () => {} });

  const productUpdateFn = ProductsHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        messageApi.success(res.message);
      },
    },
  });

  const productDeleteFn = ProductsHooks.useDelete({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
        messageApi.success(res.message);
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    title: elem?.title,
    productCode: elem?.productCode,
    thumbnail: elem?.thumbnail,
    sourcingPrice: elem?.sourcingPrice,
    sellingPrice: elem?.sellingPrice,
    stock: elem?.stock,
    saleQuantity: elem?.saleQuantity,
    variantsCount: elem?.variants?.length,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: "thumbnail",
      dataIndex: "thumbnail",
      title: "Image",
      width: 64,
      render: (thumbnail) =>
        thumbnail ? (
          <Image
            src={thumbnail}
            preview={true}
            alt="product"
            className="w-10 h-10 object-cover rounded-md border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ImagePaths.notFound;
            }}
          />
        ) : (
          "N/A"
        ),
    },
    {
      key: "title",
      dataIndex: "title",
      title: "Title",
    },
    {
      key: "productCode",
      dataIndex: "productCode",
      title: "Product Code",
      render: (productCode) => productCode || "N/A",
    },
    {
      key: "sourcingPrice",
      dataIndex: "sourcingPrice",
      title: "Sourcing",
      render: (sourcingPrice) =>
        sourcingPrice != null ? Number(sourcingPrice).toFixed(2) : "N/A",
    },
    {
      key: "sellingPrice",
      dataIndex: "sellingPrice",
      title: "Selling",
      render: (sellingPrice) =>
        sellingPrice != null ? Number(sellingPrice).toFixed(2) : "N/A",
    },
    {
      key: "stock",
      dataIndex: "stock",
      title: "Stock",
      render: (stock, record) => (
        <div>
          <div>{stock ?? 0}</div>
          {record?.variantsCount > 0 && (
            <div className="text-xs text-gray-400">
              {record.variantsCount} variants
            </div>
          )}
        </div>
      ),
    },
    {
      key: "saleQuantity",
      dataIndex: "saleQuantity",
      title: "Sold",
      render: (saleQuantity) => saleQuantity ?? 0,
    },
    {
      key: "id",
      dataIndex: "id",
      title: "Action",
      align: "center",
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <ActionMenu
            content={
              <div className="flex flex-col gap-1">
                <Button
                  title="View details"
                  onClick={() => {
                    getAccess(["products:read"], () => {
                      setDetailsItem(item);
                    });
                  }}
                >
                  <AiOutlineEye />
                </Button>
                <Button
                  title="Edit product"
                  onClick={() => {
                    getAccess(["products:update"], () => {
                      formInstance.resetFields();
                      setUpdateItem(item);
                    });
                  }}
                >
                  <AiFillEdit />
                </Button>
                <Button
                  title="Delete product"
                  danger
                  onClick={() => {
                    getAccess(["products:delete"], () => {
                      setConfirmationDialog({
                        open: true,
                        title: "Delete Product",
                        content: `Are you sure you want to delete "${item.title}"?`,
                        onConfirm: () => {
                          productDeleteFn.mutate(item.id);
                          setConfirmationDialog({
                            open: false,
                            title: "",
                            content: "",
                            onConfirm: () => {},
                          });
                        },
                      });
                    });
                  }}
                >
                  <AiFillDelete />
                </Button>
              </div>
            }
          />
        );
      },
    },
  ];

  return (
    <React.Fragment>
      {messageHolder}
      <Table
        loading={isLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        scroll={{ x: true }}
      />
      <Drawer
        width={760}
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <ProductsForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            createdBy: undefined,
          }}
          isLoading={productUpdateFn.isPending}
          onFinish={(values) => {
            const initialVariants = (updateItem?.variants ?? []).map(
              (variant) => ({
                id: variant?.id,
                variantId: variant?.variantId,
                variantOptionId: variant?.variantOptionId,
                sku: variant?.sku,
                sellingPrice: variant?.sellingPrice,
                stockQuantity: variant?.stockQuantity,
                position: variant?.position,
              }),
            );
            const diffs = Toolbox.computeArrayDiffs<any>(
              initialVariants,
              values?.variants ?? [],
              "id",
            );

            productUpdateFn.mutate({
              id: updateItem?.id,
              data: {
                ...values,
                variants: diffs.map((diff) =>
                  Toolbox.isNotEmpty(diff?.id)
                    ? diff
                    : Toolbox.omitProps(diff, ["id"]),
                ),
              },
            });
          }}
        />
      </Drawer>
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="product"
        id={detailsItem?.id}
        title={`Product Details - ${detailsItem?.title ?? ""}`}
      />
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() =>
          setConfirmationDialog({
            open: false,
            title: "",
            content: "",
            onConfirm: () => {},
          })
        }
      />
    </React.Fragment>
  );
};

export default ProductsList;
