import ConfirmationDialog from '@base/components/ConfirmationDialog';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import { ExpensesHooks } from '../lib/hooks';
import { IExpense } from '../lib/interfaces';
import ExpensesForm from './ExpensesForm';

interface IProps {
  isLoading: boolean;
  data: IExpense[];
  pagination: PaginationProps;
}

const ExpensesList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IExpense>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const expenseUpdateFn = ExpensesHooks.useUpdate({
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

  const expenseDeleteFn = ExpensesHooks.useDelete({
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
    purpose: elem?.purpose,
    amountSpent: elem?.amountSpent,
    spentBy: elem?.spentBy,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'date',
      dataIndex: 'date',
      title: 'Date',
    },
    {
      key: 'purpose',
      dataIndex: 'purpose',
      title: 'Purpose',
    },
    {
      key: 'amountSpent',
      dataIndex: 'amountSpent',
      title: 'Amount Spent',
      render: (amountSpent) => (amountSpent != null ? Number(amountSpent).toFixed(2) : 'N/A'),
    },
    {
      key: 'spentBy',
      dataIndex: 'spentBy',
      title: 'Spent By',
      render: (spentBy) => spentBy || 'N/A',
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
                getAccess(['expenses:update'], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              danger
              onClick={() => {
                getAccess(['expenses:delete'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete Expense',
                    content: `Are you sure you want to delete expense "${item.purpose}"?`,
                    onConfirm: () => {
                      expenseDeleteFn.mutate(item.id);
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
      <Drawer width={640} title={`Update Expense - ${updateItem?.purpose}`} open={!!updateItem?.id} onClose={() => setUpdateItem(null)}>
        <ExpensesForm
          formType="update"
          form={formInstance}
          initialValues={updateItem}
          isLoading={expenseUpdateFn.isPending}
          onFinish={(values) =>
            expenseUpdateFn.mutate({
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

export default ExpensesList;