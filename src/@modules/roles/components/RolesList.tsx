import ConfirmationDialog from '@base/components/ConfirmationDialog';
import ActionMenu from '@base/components/ActionMenu';
import CustomSwitch from '@base/components/CustomSwitch';
import { Paths, Roles } from '@lib/constant';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Space, Table, message } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import { RolesHooks } from '../lib/hooks';
import { IRole } from '../lib/interfaces';
import RolesForm from './RolesForm';

interface IProps {
  isLoading: boolean;
  data: IRole[];
  pagination: PaginationProps;
}

const RolesList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const router = useRouter();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IRole>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const roleUpdateFn = RolesHooks.useUpdate({
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

  const roleDeleteFn = RolesHooks.useDelete({
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
            disabled={record?.title === Roles.SUPER_ADMIN}
            checked={isActive}
            onChange={(checked) => {
              getAccess(['role-manager-roles:update'], () => {
                const action = checked ? 'activate' : 'deactivate';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Role`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    roleUpdateFn.mutate({
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
      render: (id, record) => {
        const isDisabled = record?.title === Roles.SUPER_ADMIN;
        const item = data?.find((item) => item.id === id);

        return (
          <ActionMenu content={<Space direction="vertical">
            <Button
              title="Edit permissions"
              type="primary"
              ghost
              disabled={isDisabled}
              onClick={() => {
                getAccess(['role-manager-roles:update'], () => {
                  const path = Paths.admin.roleManager.roles.toId(id);
                  router.push(path);
                });
              }}
            >
              Edit Permissions
            </Button>
            <Button
              title="Edit role"
              disabled={isDisabled}
              type="primary"
              onClick={() => {
                getAccess(['role-manager-roles:update'], () => {
                  formInstance.resetFields();
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              title="Delete role"
              danger
              disabled={isDisabled}
              onClick={() => {
                getAccess(['role-manager-roles:delete'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete Role',
                    content: `Are you sure you want to delete "${item.title}"?`,
                    onConfirm: () => {
                      roleDeleteFn.mutate(item.id);
                      setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                    },
                  });
                });
              }}
            >
              <AiFillDelete />
            </Button>
          </Space>} />
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
        width={450}
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <RolesForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{ ...updateItem, isActive: updateItem?.isActive }}
          isLoading={roleUpdateFn.isPending}
          onFinish={(values) =>
            roleUpdateFn.mutate({
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

export default RolesList;
