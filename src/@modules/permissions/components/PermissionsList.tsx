import ConfirmationDialog from '@base/components/ConfirmationDialog';
import ActionMenu from '@base/components/ActionMenu';
import CustomSwitch from '@base/components/CustomSwitch';
import { Toolbox } from '@lib/utils';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, message, Table } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import { PermissionsHooks } from '../lib/hooks';
import { IPermission } from '../lib/interfaces';
import PermissionsFilter from './PermissionsFilter';
import PermissionsForm from './PermissionsForm';

interface IProps {
  isLoading: boolean;
  data: IPermission[];
  pagination: PaginationProps;
}

const PermissionsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IPermission>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const permissionUpdateFn = PermissionsHooks.useUpdate({
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

  const permissionDeleteFn = PermissionsHooks.useDelete({
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
    type: elem?.permissionType?.title,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
    },
    {
      key: 'type',
      dataIndex: 'type',
      title: 'Type',
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: 'Created At',
      render: (createdAt) => <p className="min-w-24">{dayjs(createdAt).format('DD-MM-YYYY')}</p>,
    },
    {
      key: 'isActive',
      dataIndex: 'isActive',
      title: 'Active',
      render: (isActive, record) => {
        return (
          <CustomSwitch
            checked={isActive}
            onChange={(checked) => {
              getAccess(['role-manager-permissions:update'], () => {
                const action = checked ? 'activate' : 'deactivate';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Permission`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    permissionUpdateFn.mutate({
                      id: record?.id,
                      data: {
                        isActive: checked,
                      },
                    });
                    setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                  },
                });
              });
            }}
          />
        );
      },
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <ActionMenu content={<div className="flex flex-col gap-1">
            <Button
              title="Edit permission"
              type="primary"
              onClick={() => {
                getAccess(['role-manager-permissions:update'], () => {
                  formInstance.resetFields();
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              title="Delete permission"
              danger
              onClick={() => {
                getAccess(['role-manager-permissions:delete'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete Permission',
                    content: `Are you sure you want to delete "${item.title}"?`,
                    onConfirm: () => {
                      permissionDeleteFn.mutate(item.id);
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
      <PermissionsFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <Table
        loading={isLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        scroll={{ x: true }}
      />
      <Drawer
        width={450}
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <PermissionsForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            isActive: updateItem?.isActive,
          }}
          isLoading={permissionUpdateFn.isPending}
          onFinish={(values) =>
            permissionUpdateFn.mutate({
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

export default PermissionsList;
