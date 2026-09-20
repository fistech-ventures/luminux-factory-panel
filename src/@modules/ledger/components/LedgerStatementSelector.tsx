'use client';

import { Toolbox } from '@lib/utils';
import { CustomersHooks } from '@modules/customers/lib/hooks';
import { SuppliersHooks } from '@modules/suppliers/lib/hooks';
import { ILedgerStatementOptions } from '@modules/ledger/lib/interfaces';
import { Button, DatePicker, Form, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface IProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (options: ILedgerStatementOptions) => void;
}

const LedgerStatementSelector: React.FC<IProps> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const entityType = Form.useWatch('entityType', form);
  const customersQuery = CustomersHooks.useFind({ options: { page: 1, limit: 300 } });
  const suppliersQuery = SuppliersHooks.useFind({ options: { page: 1, limit: 300 } });

  const partyOptions = entityType === 'supplier'
    ? suppliersQuery.data?.data?.map((supplier) => ({ label: supplier.companyName, value: supplier.id }))
    : customersQuery.data?.data?.map((customer) => ({ label: customer.companyName, value: customer.id }));

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal title="View Statement" open={open} onCancel={handleClose} footer={null} destroyOnClose>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          const range = values.dateRange;
          onSubmit({
            entityType: values.entityType,
            entityId: values.entityId,
            ...(range?.length
              ? {
                  startDate: dayjs(range[0]).format('YYYY-MM-DD'),
                  endDate: dayjs(range[1]).format('YYYY-MM-DD'),
                }
              : {}),
          });
          form.resetFields();
        }}
      >
        <Form.Item name="entityType" label="Entity type" rules={[{ required: true, message: 'Select an entity type.' }]}>
          <Select
            placeholder="Select entity type"
            options={[
              { label: 'Customer', value: 'customer' },
              { label: 'Supplier', value: 'supplier' },
            ]}
            onChange={() => form.setFieldValue('entityId', undefined)}
          />
        </Form.Item>
        <Form.Item name="entityId" label="Party" rules={[{ required: true, message: 'Select a party.' }]}>
          <Select
            showSearch
            allowClear
            disabled={!entityType}
            placeholder={entityType === 'supplier' ? 'Search suppliers' : 'Search customers'}
            options={Toolbox.toCleanArray(partyOptions)}
            filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item name="dateRange" label="Date range">
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>
        <div className="flex justify-end">
          <Button type="primary" htmlType="submit">
            View Statement
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default LedgerStatementSelector;