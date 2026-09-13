import ConfirmationDialog from '@base/components/ConfirmationDialog';
import RecordDetailsModal from '@base/components/RecordDetailsModal';
import { Paths } from '@lib/constant';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete, AiOutlineEye } from 'react-icons/ai';
import { FaBook } from 'react-icons/fa';
import { SuppliersHooks } from '../lib/hooks';
import { ISupplier } from '../lib/interfaces';
import SuppliersForm from './SuppliersForm';

interface IProps {
  isLoading: boolean;
  data: ISupplier[];
  pagination: PaginationProps;
}

const SuppliersList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const router = useRouter();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<ISupplier>(null);
  const [detailsItem, setDetailsItem] = useState<ISupplier>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const supplierUpdateFn = SuppliersHooks.useUpdate({
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

  const supplierDeleteFn = SuppliersHooks.useDelete({
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
    companyName: elem?.companyName,
    contactPerson: elem?.contactPerson,
    contactNumber: elem?.contactNumber,
    email: elem?.email,
    address: elem?.address,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'companyName',
      dataIndex: 'companyName',
      title: 'Company',
    },
    {
      key: 'contactPerson',
      dataIndex: 'contactPerson',
      title: 'Contact Person',
      render: (contactPerson) => contactPerson || 'N/A',
    },
    {
      key: 'contactNumber',
      dataIndex: 'contactNumber',
      title: 'Contact Number',
      render: (contactNumber) => contactNumber || 'N/A',
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: 'Email',
      render: (email) => email || 'N/A',
    },
    {
      key: 'address',
      dataIndex: 'address',
      title: 'Address',
      render: (address) => address || 'N/A',
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
                getAccess(['suppliers:read'], () => {
                  router.push(`${Paths.admin.ledger.list}?entityType=supplier&entityId=${id}`);
                });
              }}
            >
              <FaBook />
            </Button>
            <Button
              onClick={() => {
                getAccess(['suppliers:read'], () => {
                  setDetailsItem(item);
                });
              }}
            >
              <AiOutlineEye />
            </Button>
            <Button
              onClick={() => {
                getAccess(['suppliers:update'], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              danger
              onClick={() => {
                getAccess(['suppliers:delete'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete Supplier',
                    content: `Are you sure you want to delete "${item.companyName}"?`,
                    onConfirm: () => {
                      supplierDeleteFn.mutate(item.id);
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
        title={`Update ${updateItem?.companyName}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <SuppliersForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            createdBy: undefined,
          }}
          isLoading={supplierUpdateFn.isPending}
          onFinish={(values) =>
            supplierUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="supplier"
        id={detailsItem?.id}
        title={`Supplier Details - ${detailsItem?.companyName ?? ''}`}
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

export default SuppliersList;