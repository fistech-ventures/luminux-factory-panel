import ConfirmationDialog from '@base/components/ConfirmationDialog';
import ActionMenu from '@base/components/ActionMenu';
import RecordDetailsModal from '@base/components/RecordDetailsModal';
import CustomSwitch from '@base/components/CustomSwitch';
import { Toolbox } from '@lib/utils';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Avatar, Button, Drawer, Form, Table, Tag, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete, AiOutlineEye } from 'react-icons/ai';
import { UsersHooks } from '../lib/hooks';
import { IUser } from '../lib/interfaces';
import UsersForm from './UsersForm';

interface IProps {
  isLoading: boolean;
  data: IUser[];
  pagination: PaginationProps;
}

const UsersList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IUser>(null);
  const [detailsItem, setDetailsItem] = useState<IUser>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const userUpdateFn = UsersHooks.useUpdate({
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

  const userUpdateRolesFn = UsersHooks.useUpdateRoles({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
      },
    },
  });

  const userDeleteFn = UsersHooks.useDelete({
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

  /** Build the initial role-links the backend expects for the PATCH /users/:id/roles diff. Supports both flat and nested userRoles. */
  const buildInitialRoleLinks = (userRoles: any[]): { role: string }[] =>
    (userRoles ?? []).map((userRole) => ({ role: userRole?.role?.id ?? userRole?.roleId }));

  const handleUpdateFinishFn = (values: any) => {
    const initialRoleLinks = buildInitialRoleLinks(updateItem?.userRoles ?? []);
    const currentRoleLinks = (values?.roles ?? []).map((roleId: any) => ({ role: roleId }));
    const roleDiffs = Toolbox.computeArrayDiffs<any>(initialRoleLinks, currentRoleLinks, 'role');
    const profileData = { ...values };
    delete profileData.roles;

    if (roleDiffs.length) {
      userUpdateRolesFn.mutate({ id: updateItem?.id, data: { roles: roleDiffs } });
    }

    userUpdateFn.mutate({ id: updateItem?.id, data: profileData });
  };

  /** Backend may return userRoles as [{ roleId }] (flat) or [{ role: { id, title } }] (nested). Normalize to role objects. */
  const normalizeUserRoles = (userRoles: { role?: any; roleId?: any }[]): any[] =>
    userRoles?.map((userRole) => ({
      id: userRole?.role?.id ?? userRole?.roleId,
      title: userRole?.role?.title ?? userRole?.roleId,
    })) ?? [];

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    avatar: elem?.avatar,
    fullName: elem?.fullName,
    gender: elem?.gender,
    phoneNumber: elem?.phoneNumber,
    email: elem?.email,
    roles: normalizeUserRoles(elem?.userRoles ?? []),
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'fullName',
      dataIndex: 'fullName',
      title: 'Name',
      render: (fullName, record) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" src={record?.avatar}>
            {fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <span>{fullName || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: 'Email',
    },
    {
      key: 'phoneNumber',
      dataIndex: 'phoneNumber',
      title: 'Phone',
      render: (phoneNumber) => phoneNumber || 'N/A',
    },
    {
      key: 'roles',
      dataIndex: 'roles',
      title: 'Roles',
      render: (roles) =>
        roles?.length ? (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Tag key={role?.id}>{role?.title}</Tag>
            ))}
          </div>
        ) : (
          'N/A'
        ),
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
              getAccess(['users:update'], () => {
                const action = checked ? 'activate' : 'deactivate';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
                  content: `Are you sure you want to ${action} user "${record.email}"?`,
                  onConfirm: () => {
                    userUpdateFn.mutate({
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
      align: 'center',
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <ActionMenu content={<div className="flex flex-col gap-1">
            <Button
              title="View details"
              onClick={() => {
                getAccess(['users:read'], () => {
                  setDetailsItem(item);
                });
              }}
            >
              <AiOutlineEye />
            </Button>
            <Button
              title="Edit user"
              onClick={() => {
                getAccess(['users:update'], () => {
                  formInstance.resetFields();
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              title="Delete user"
              danger
              onClick={() => {
                getAccess(['users:delete'], () => {
                  const isSuperAdmin = (item?.userRoles ?? []).some(
                    (userRole) => (userRole?.role?.title || '').toLowerCase() === 'super admin',
                  );

                  if (isSuperAdmin) {
                    setConfirmationDialog({
                      open: true,
                      title: 'Cannot Delete User',
                      content: `User "${item.email}" has role "Super Admin" and cannot be deleted.`,
                      onConfirm: () => {
                        setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                      },
                    });
                    return;
                  }

                  setConfirmationDialog({
                    open: true,
                    title: 'Delete User',
                    content: `Are you sure you want to delete user "${item.email}"?`,
                    onConfirm: () => {
                      userDeleteFn.mutate(item.id);
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
        width={640}
        title={`Update ${updateItem?.fullName}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <UsersForm
          key={updateItem?.id}
          userId={updateItem?.id as string}
          formType="update"
          form={formInstance}
          initialValues={updateItem}
          isLoading={userUpdateFn.isPending || userUpdateRolesFn.isPending}
          onFinish={handleUpdateFinishFn}
          backendError={userUpdateFn.isError ? String(userUpdateFn.error) : null}
        />
      </Drawer>
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="user"
        id={detailsItem?.id}
        title={`User Details - ${detailsItem?.fullName ?? detailsItem?.email ?? ''}`}
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

export default UsersList;