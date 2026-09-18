import ConfirmationDialog from '@base/components/ConfirmationDialog';
import ActionMenu from '@base/components/ActionMenu';
import RecordDetailsModal from '@base/components/RecordDetailsModal';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete, AiOutlineEye } from 'react-icons/ai';
import { PurchasesHooks } from '../lib/hooks';
import { IPurchase } from '../lib/interfaces';
import PurchasesForm from './PurchasesForm';

interface IProps {
  isLoading: boolean;
  data: IPurchase[];
  pagination: PaginationProps;
}

const PurchasesList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IPurchase>(null);
  const [detailsItem, setDetailsItem] = useState<IPurchase>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const purchaseUpdateFn = PurchasesHooks.useUpdate({
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

  const purchaseDeleteFn = PurchasesHooks.useDelete({
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
    purchaseDate: elem?.purchaseDate,
    purchaseType: elem?.purchaseType,
    supplierName: elem?.supplier?.companyName,
    itemsCount: elem?.items?.length,
    totalQuantity: elem?.totalQuantity,
    totalPurchaseAmount: elem?.totalPurchaseAmount,
    paidAmount: elem?.paidAmount,
    dueAmount: elem?.dueAmount,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'purchaseDate',
      dataIndex: 'purchaseDate',
      title: 'Date',
    },
    {
      key: 'purchaseType',
      dataIndex: 'purchaseType',
      title: 'Type',
      render: (purchaseType) => purchaseType || 'N/A',
    },
    {
      key: 'supplierName',
      dataIndex: 'supplierName',
      title: 'Supplier',
      render: (supplierName) => supplierName || 'N/A',
    },
    {
      key: 'itemsCount',
      dataIndex: 'itemsCount',
      title: 'Items',
      render: (itemsCount) => itemsCount ?? 0,
    },
    {
      key: 'totalQuantity',
      dataIndex: 'totalQuantity',
      title: 'Quantity',
    },
    {
      key: 'totalPurchaseAmount',
      dataIndex: 'totalPurchaseAmount',
      title: 'Total',
      render: (totalPurchaseAmount) => (totalPurchaseAmount != null ? Number(totalPurchaseAmount).toFixed(2) : 'N/A'),
    },
    {
      key: 'paidAmount',
      dataIndex: 'paidAmount',
      title: 'Paid',
      render: (paidAmount) => (paidAmount != null ? Number(paidAmount).toFixed(2) : 'N/A'),
    },
    {
      key: 'dueAmount',
      dataIndex: 'dueAmount',
      title: 'Due',
      render: (dueAmount) => (dueAmount != null ? Number(dueAmount).toFixed(2) : 'N/A'),
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
              title="View details"
              onClick={() => {
                getAccess(['purchases:read'], () => {
                  setDetailsItem(item);
                });
              }}
            >
              <AiOutlineEye />
            </Button>
            <Button
              title="Edit purchase"
              onClick={() => {
                getAccess(['purchases:update'], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              title="Delete purchase"
              danger
              onClick={() => {
                getAccess(['purchases:delete'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete Purchase',
                    content: `Are you sure you want to delete the purchase from ${item?.supplier?.companyName || 'this supplier'}?`,
                    onConfirm: () => {
                      purchaseDeleteFn.mutate(item.id);
                      setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                    },
                  });
                });
              }}
            >
              <AiFillDelete />
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
        width={860}
        title={`Update Purchase - ${updateItem?.purchaseDate}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <PurchasesForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            supplier: updateItem?.supplier,
            createdBy: undefined,
          }}
          isLoading={purchaseUpdateFn.isPending}
          onFinish={(values) =>
            purchaseUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
          _onSuccess={() => {
            setUpdateItem(null);
            formInstance.resetFields();
          }}
        />
      </Drawer>
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="purchase"
        id={detailsItem?.id}
        title={`Purchase Details - ${detailsItem?.purchaseDate ?? ''}`}
      />
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

export default PurchasesList;