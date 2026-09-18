import ConfirmationDialog from '@base/components/ConfirmationDialog';
import ActionMenu from '@base/components/ActionMenu';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { ProductVariantOptionsHooks } from '../lib/hooks';
import { IProductVariantOption } from '../lib/interfaces';
import ProductVariantOptionsForm from './ProductVariantOptionsForm';

interface IProps {
  isLoading: boolean;
  data: IProductVariantOption[];
  pagination: PaginationProps;
}

const ProductVariantOptionsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IProductVariantOption>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const itemUpdateFn = ProductVariantOptionsHooks.useUpdate({
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

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    productTitle: elem?.product?.title,
    productCode: elem?.product?.productCode,
    variantTitle: elem?.variant?.title,
    variantOptionTitle: elem?.variantOption?.title,
    sku: elem?.sku,
    sellingPrice: elem?.sellingPrice,
    stockQuantity: elem?.stockQuantity,
    isActive: elem?.isActive,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'productTitle',
      dataIndex: 'productTitle',
      title: 'Product',
      render: (productTitle, record) => (
        <div>
          <div>{productTitle || 'N/A'}</div>
          {record?.productCode && <div className="text-xs text-gray-400">{record.productCode}</div>}
        </div>
      ),
    },
    {
      key: 'variantTitle',
      dataIndex: 'variantTitle',
      title: 'Variant',
      render: (variantTitle) => variantTitle || 'N/A',
    },
    {
      key: 'variantOptionTitle',
      dataIndex: 'variantOptionTitle',
      title: 'Variant Option',
      render: (variantOptionTitle) => variantOptionTitle || 'N/A',
    },
    {
      key: 'sku',
      dataIndex: 'sku',
      title: 'SKU',
      render: (sku) => sku || 'N/A',
    },
    {
      key: 'sellingPrice',
      dataIndex: 'sellingPrice',
      title: 'Selling Price',
      render: (sellingPrice) => (sellingPrice != null ? Number(sellingPrice).toFixed(2) : 'N/A'),
    },
    {
      key: 'stockQuantity',
      dataIndex: 'stockQuantity',
      title: 'Stock',
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <ActionMenu content={<div className="flex flex-col gap-1">
            <Button
              title="Edit product variant option"
              onClick={() => {
                getAccess(['product-variant-options:update'], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
          </div>} />
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
        width={640}
        title={`Update ${updateItem?.sku || updateItem?.variantOption?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <ProductVariantOptionsForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            product: updateItem?.product,
          }}
          isLoading={itemUpdateFn.isPending}
          onFinish={(values) =>
            itemUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} })}
      />
    </React.Fragment>
  );
};

export default ProductVariantOptionsList;