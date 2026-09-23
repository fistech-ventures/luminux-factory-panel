import ActionMenu from '@base/components/ActionMenu';
import ConfirmationDialog from '@base/components/ConfirmationDialog';
import RecordDetailsModal from '@base/components/RecordDetailsModal';
import { Paths } from '@lib/constant';
import { getAccess } from '@modules/auth/lib/utils/client';
import PaymentsForm from '@modules/payments/components/PaymentsForm';
import { PaymentsHooks } from '@modules/payments/lib/hooks';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { AiFillDelete, AiFillEdit, AiOutlineEye } from 'react-icons/ai';
import { FaBook } from 'react-icons/fa';
import { FiFileText, FiPlusCircle } from 'react-icons/fi';
import { EmployeesHooks } from '../lib/hooks';
import { IEmployee } from '../lib/interfaces';
import EmployeesForm from './EmployeesForm';

interface IProps {
  isLoading: boolean;
  data: IEmployee[];
  pagination: PaginationProps;
}

const EmployeesList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const router = useRouter();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [advanceFormInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IEmployee>(null);
  const [detailsItem, setDetailsItem] = useState<IEmployee>(null);
  const [advanceItem, setAdvanceItem] = useState<IEmployee>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const employeeUpdateFn = EmployeesHooks.useUpdate({
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

  const employeeDeleteFn = EmployeesHooks.useDelete({
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

  const advanceCreateFn = PaymentsHooks.useCreate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setAdvanceItem(null);
        advanceFormInstance.resetFields();
        messageApi.success(res.message);
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    employeeId: elem?.employeeId,
    name: elem?.name,
    phoneNumber: elem?.phoneNumber,
    email: elem?.email,
    designation: elem?.designation,
    createdBy: elem?.createdBy,
    updatedBy: elem?.updatedBy,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    { key: 'employeeId', dataIndex: 'employeeId', title: 'Employee ID' },
    { key: 'name', dataIndex: 'name', title: 'Name' },
    {
      key: 'phoneNumber',
      dataIndex: 'phoneNumber',
      title: 'Phone Number',
      render: (phoneNumber) => phoneNumber || 'N/A',
    },
    { key: 'email', dataIndex: 'email', title: 'Email', render: (email) => email || 'N/A' },
    {
      key: 'designation',
      dataIndex: 'designation',
      title: 'Designation',
      render: (designation) => designation || 'N/A',
    },
    {
      key: 'createdBy',
      dataIndex: 'createdBy',
      title: 'Created By',
      render: (createdBy) => createdBy?.fullName || 'N/A',
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => {
        const item = data?.find((elem) => elem.id === id);
        return (
          <ActionMenu
            content={
              <div className="flex flex-col gap-1">
                <Button
                  title="Give advance"
                  onClick={() => {
                    getAccess(['payments:write'], () => {
                      advanceFormInstance.resetFields();
                      setAdvanceItem(item);
                    });
                  }}
                >
                  <FiPlusCircle />
                </Button>
                <Button
                  title="View ledger"
                  onClick={() => {
                    getAccess(['employees:read'], () => {
                      router.push(`${Paths.admin.ledger.list}?entityType=employee&entityId=${id}`);
                    });
                  }}
                >
                  <FaBook />
                </Button>
                <Button
                  title="View statement"
                  onClick={() => {
                    getAccess(['employees:read'], () => {
                      router.push(
                        `${Paths.admin.ledger.statement}?entityType=employee&entityId=${id}`,
                      );
                    });
                  }}
                >
                  <FiFileText />
                </Button>
                <Button
                  title="View details"
                  onClick={() => {
                    getAccess(['employees:read'], () => {
                      setDetailsItem(item);
                    });
                  }}
                >
                  <AiOutlineEye />
                </Button>
                <Button
                  title="Edit employee"
                  onClick={() => {
                    getAccess(['employees:update'], () => {
                      formInstance.resetFields();
                      setUpdateItem(item);
                    });
                  }}
                >
                  <AiFillEdit />
                </Button>
                <Button
                  title="Delete employee"
                  danger
                  onClick={() => {
                    getAccess(['employees:delete'], () => {
                      setConfirmationDialog({
                        open: true,
                        title: 'Delete Employee',
                        content: `Are you sure you want to delete "${item.name}"?`,
                        onConfirm: () => {
                          employeeDeleteFn.mutate(item.id);
                          setConfirmationDialog({
                            open: false,
                            title: '',
                            content: '',
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
        width={640}
        title={`Update ${updateItem?.name ?? ''}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <EmployeesForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{ ...updateItem, createdBy: undefined }}
          isLoading={employeeUpdateFn.isPending}
          onFinish={(values) =>
            employeeUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
      <Drawer
        width={640}
        title={`Give Advance - ${advanceItem?.name ?? ''}`}
        open={!!advanceItem?.id}
        onClose={() => setAdvanceItem(null)}
      >
        <PaymentsForm
          form={advanceFormInstance}
          isLoading={advanceCreateFn.isPending}
          initialValues={{
            entityType: 'employee',
            entityId: advanceItem?.id != null ? String(advanceItem.id) : undefined,
            paymentDate: new Date(),
          }}
          onFinish={(values) => advanceCreateFn.mutate(values)}
        />
      </Drawer>
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="employee"
        id={detailsItem?.id}
        title={`Employee Details - ${detailsItem?.name ?? ''}`}
      />
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() =>
          setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} })
        }
      />
    </React.Fragment>
  );
};

export default EmployeesList;
