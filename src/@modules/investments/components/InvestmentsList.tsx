import ActionMenu from '@base/components/ActionMenu';
import ConfirmationDialog from '@base/components/ConfirmationDialog';
import RecordDetailsModal from '@base/components/RecordDetailsModal';
import { Permissions } from '@lib/constant';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useState } from 'react';
import { AiFillDelete, AiFillEdit, AiOutlineEye } from 'react-icons/ai';
import { InvestmentsHooks } from '../lib/hooks';
import { IInvestment } from '../lib/interfaces';
import InvestmentsForm from './InvestmentsForm';

interface IProps {
  isLoading: boolean;
  data: IInvestment[];
  pagination: PaginationProps;
}

const InvestmentsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IInvestment>(null);
  const [detailsItem, setDetailsItem] = useState<IInvestment>(null);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: () => {},
  });

  const updateFn = InvestmentsHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) return messageApi.error(res.message);
        setUpdateItem(null);
        messageApi.success(res.message);
      },
    },
  });
  const deleteFn = InvestmentsHooks.useDelete({
    config: {
      onSuccess: (res) => {
        if (!res.success) return messageApi.error(res.message);
        messageApi.success(res.message);
      },
    },
  });

  const columns: TableColumnsType<IInvestment> = [
    { key: 'date', dataIndex: 'date', title: 'Date', render: (date) => date || 'N/A' },
    { key: 'title', dataIndex: 'title', title: 'Title' },
    { key: 'investor', title: 'Investor', render: (_, item) => item.investor?.name || 'N/A' },
    { key: 'amount', dataIndex: 'amount', title: 'Amount', render: (amount) => Number(amount ?? 0).toFixed(2) },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => {
        const item = data?.find((investment) => investment.id === id);
        return (
          <ActionMenu
            content={
              <div className="flex flex-col gap-1">
                <Button title="View details" onClick={() => getAccess([Permissions.INVESTMENTS_READ], () => setDetailsItem(item))}>
                  <AiOutlineEye />
                </Button>
                <Button title="Edit investment" onClick={() => getAccess([Permissions.INVESTMENTS_UPDATE], () => { formInstance.resetFields(); setUpdateItem(item); })}>
                  <AiFillEdit />
                </Button>
                <Button title="Delete investment" danger onClick={() => getAccess([Permissions.INVESTMENTS_DELETE], () => setConfirmationDialog({
                  open: true,
                  title: 'Delete Investment',
                  content: `Are you sure you want to delete "${item.title}"?`,
                  onConfirm: () => {
                    deleteFn.mutate(item.id);
                    setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                  },
                }))}>
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
      <Table loading={isLoading} dataSource={data} rowKey="id" columns={columns} pagination={pagination} scroll={{ x: true }} />
      <Drawer width={640} title={`Update Investment - ${updateItem?.title ?? ''}`} open={!!updateItem?.id} onClose={() => setUpdateItem(null)}>
        <InvestmentsForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={updateItem}
          isLoading={updateFn.isPending}
          onFinish={(values) => updateFn.mutate({ id: updateItem.id, data: values })}
        />
      </Drawer>
      <RecordDetailsModal open={!!detailsItem?.id} onClose={() => setDetailsItem(null)} resource="investment" title={`Investment Details - ${detailsItem?.title ?? ''}`} id={detailsItem?.id} />
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

export default InvestmentsList;
