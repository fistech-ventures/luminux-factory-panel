import ConfirmationDialog from '@base/components/ConfirmationDialog';
import RecordDetailsModal from '@base/components/RecordDetailsModal';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, Tag, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete, AiOutlineEye } from 'react-icons/ai';
import { LedgerHooks } from '../lib/hooks';
import { ILedger } from '../lib/interfaces';
import LedgerForm from './LedgerForm';

interface IProps {
  isLoading: boolean;
  data: ILedger[];
  pagination: PaginationProps;
}

const LedgerList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<ILedger>(null);
  const [detailsItem, setDetailsItem] = useState<ILedger>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const ledgerUpdateFn = LedgerHooks.useUpdate({
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

  const ledgerDeleteFn = LedgerHooks.useDelete({
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
    transactionDate: elem?.transactionDate,
    entityType: elem?.entityType,
    entityId: elem?.entityId,
    type: elem?.type,
    amount: elem?.amount,
    description: elem?.description,
    referenceType: elem?.referenceType,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'transactionDate',
      dataIndex: 'transactionDate',
      title: 'Date',
    },
    {
      key: 'entityType',
      dataIndex: 'entityType',
      title: 'Entity',
      render: (entityType) => <Tag color={entityType === 'supplier' ? 'geekblue' : 'purple'}>{entityType}</Tag>,
    },
    {
      key: 'type',
      dataIndex: 'type',
      title: 'Type',
      render: (type) => <Tag color={type === 'paid' ? 'green' : 'orange'}>{type}</Tag>,
    },
    {
      key: 'amount',
      dataIndex: 'amount',
      title: 'Amount',
      render: (amount) => (amount != null ? Number(amount).toFixed(2) : 'N/A'),
    },
    {
      key: 'description',
      dataIndex: 'description',
      title: 'Description',
      render: (description) => description || 'N/A',
    },
    {
      key: 'referenceType',
      dataIndex: 'referenceType',
      title: 'Reference',
      render: (referenceType) => referenceType || 'N/A',
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
                getAccess(['ledger:read'], () => {
                  setDetailsItem(item);
                });
              }}
            >
              <AiOutlineEye />
            </Button>
            <Button
              onClick={() => {
                getAccess(['ledger:update'], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              danger
              onClick={() => {
                getAccess(['ledger:delete'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete Ledger Entry',
                    content: 'Are you sure you want to delete this ledger entry?',
                    onConfirm: () => {
                      ledgerDeleteFn.mutate(item.id);
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
      <Drawer
        width={640}
        title={`Update Ledger Entry - ${updateItem?.type}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <LedgerForm
          formType="update"
          form={formInstance}
          initialValues={updateItem}
          isLoading={ledgerUpdateFn.isPending}
          onFinish={(values) =>
            ledgerUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="ledger"
        id={detailsItem?.id}
        title={`Ledger Entry Details - ${detailsItem?.type ?? ''}`}
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

export default LedgerList;