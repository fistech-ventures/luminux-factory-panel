import ConfirmationDialog from '@base/components/ConfirmationDialog';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import { FiFileText } from 'react-icons/fi';
import { SalesHooks } from '../lib/hooks';
import { ISale } from '../lib/interfaces';
import SalesForm from './SalesForm';

interface IProps {
  isLoading: boolean;
  data: ISale[];
  pagination: PaginationProps;
}

const SalesList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<ISale>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const saleUpdateFn = SalesHooks.useUpdate({
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

  const saleDeleteFn = SalesHooks.useDelete({
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
    date: elem?.date,
    invoiceNo: elem?.invoiceNo,
    customerName: elem?.customer?.name,
    itemsCount: elem?.items?.length,
    totalAmount: elem?.totalAmount,
    discount: elem?.discount,
    grandTotal: elem?.grandTotal,
    paidAmount: elem?.paidAmount,
    dueAmount: elem?.dueAmount,
    paymentMethod: elem?.paymentMethod,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'date',
      dataIndex: 'date',
      title: 'Date',
    },
    {
      key: 'invoiceNo',
      dataIndex: 'invoiceNo',
      title: 'Invoice',
      render: (invoiceNo) => invoiceNo || 'N/A',
    },
    {
      key: 'customerName',
      dataIndex: 'customerName',
      title: 'Customer',
      render: (customerName) => customerName || 'N/A',
    },
    {
      key: 'itemsCount',
      dataIndex: 'itemsCount',
      title: 'Items',
      render: (itemsCount) => itemsCount ?? 0,
    },
    {
      key: 'totalAmount',
      dataIndex: 'totalAmount',
      title: 'Total',
      render: (totalAmount) => (totalAmount != null ? Number(totalAmount).toFixed(2) : 'N/A'),
    },
    {
      key: 'discount',
      dataIndex: 'discount',
      title: 'Discount',
      render: (discount) => (discount != null ? Number(discount).toFixed(2) : 'N/A'),
    },
    {
      key: 'grandTotal',
      dataIndex: 'grandTotal',
      title: 'Grand Total',
      render: (grandTotal) => (grandTotal != null ? Number(grandTotal).toFixed(2) : 'N/A'),
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
      key: 'paymentMethod',
      dataIndex: 'paymentMethod',
      title: 'Payment',
      render: (paymentMethod) => paymentMethod || 'N/A',
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button
              onClick={() => {
                getAccess(['sales:read'], () => {
                  if (item?.invoiceUrl) {
                    window.open(item.invoiceUrl, '_blank');
                  }
                });
              }}
            >
              <FiFileText />
            </Button>
            <Button
              onClick={() => {
                getAccess(['sales:update'], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              danger
              onClick={() => {
                getAccess(['sales:delete'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete Sale',
                    content: `Are you sure you want to delete sale "${item.invoiceNo}"?`,
                    onConfirm: () => {
                      saleDeleteFn.mutate(item.id);
                      setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                    },
                  });
                });
              }}
            >
              <AiFillDelete />
            </Button>
          </div>
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
      <Drawer width={860} title={`Update Sale - ${updateItem?.invoiceNo}`} open={!!updateItem?.id} onClose={() => setUpdateItem(null)}>
        <SalesForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            customer: updateItem?.customer,
          }}
          isLoading={saleUpdateFn.isPending}
          onFinish={(values) =>
            saleUpdateFn.mutate({
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

export default SalesList;