'use client';

import { Toolbox } from '@lib/utils';
import { CustomersHooks } from '@modules/customers/lib/hooks';
import { EmployeesHooks } from '@modules/employees/lib/hooks';
import { SuppliersHooks } from '@modules/suppliers/lib/hooks';
import { Button, DatePicker, Drawer, Form, Radio, Select, Space } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';
import { ILedgerFilter } from '../lib/interfaces';

interface IProps {
  initialValues: ILedgerFilter;
  onChange: (values: ILedgerFilter) => void;
}

const LedgerFilter: React.FC<IProps> = ({ initialValues, onChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const entityType = Form.useWatch('entityType', formInstance) || initialValues?.entityType || '';

  const customersQuery = CustomersHooks.useFind({
    options: {
      page: 1,
      limit: 300,
    },
  });

  const suppliersQuery = SuppliersHooks.useFind({
    options: {
      page: 1,
      limit: 300,
    },
  });

  const employeesQuery = EmployeesHooks.useFind({
    options: {
      page: 1,
      limit: 300,
    },
  });

  useEffect(() => {
    formInstance.resetFields();

    const values = {
      sortOrder: '',
      dateRange: [],
      ...initialValues,
    };

    if (values?.startDate && values?.endDate) {
      values.dateRange.push(dayjs(values.startDate));
      values.dateRange.push(dayjs(values.endDate));

      delete values.startDate;
      delete values.endDate;
    }

    formInstance.setFieldsValue(values);
  }, [formInstance, initialValues]);

  const entityOptions =
    entityType === 'supplier'
      ? suppliersQuery.data?.data?.map((supplier) => ({
          key: supplier?.id,
          label: supplier?.companyName,
          value: supplier?.id,
        }))
      : entityType === 'employee'
        ? employeesQuery.data?.data?.map((employee) => ({
            key: employee?.id,
            label: `${employee?.name} (${employee?.employeeId})`,
            value: employee?.id,
          }))
        : customersQuery.data?.data?.map((customer) => ({
            key: customer?.id,
            label: customer?.name,
            value: customer?.id,
          }));

  return (
    <div className="flex flex-wrap gap-3 justify-end mb-4">
      <Button type="primary" icon={<FaFilter />} onClick={() => setDrawerOpen(true)} ghost>
        Filter
      </Button>
      <Drawer width={460} title="Filter" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <Form
          form={formInstance}
          onFinish={(values) => {
            values.startDate = values?.dateRange?.length ? dayjs(values?.dateRange?.[0]).format('YYYY-MM-DD') : null;
            values.endDate = values?.dateRange?.length ? dayjs(values?.dateRange?.[1]).format('YYYY-MM-DD') : null;

            delete values.dateRange;
            onChange(Toolbox.toCleanObject(values));
            setDrawerOpen(false);
          }}
          className="flex flex-col gap-3"
        >
          <Form.Item name="entityType" className="!mb-0">
            <Radio.Group buttonStyle="solid" className="w-full text-center">
              <Radio.Button className="w-1/4" value="">
                All
              </Radio.Button>
              <Radio.Button className="w-1/4" value="customer">
                Customer
              </Radio.Button>
              <Radio.Button className="w-1/4" value="supplier">
                Supplier
              </Radio.Button>
              <Radio.Button className="w-1/4" value="employee">
                Employee
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          {entityType && (
            <Form.Item name="entityId" className="!mb-0">
              <Select
                allowClear
                showSearch
                placeholder={
                  entityType === 'supplier' ? 'Supplier' : entityType === 'employee' ? 'Employee' : 'Customer'
                }
                options={Toolbox.toCleanArray(entityOptions)}
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          )}
          <Form.Item name="type" className="!mb-0">
            <Select
              allowClear
              placeholder="Type"
              options={
                entityType === 'employee'
                  ? [
                      { key: 'advance', label: 'Advance', value: 'advance' },
                      { key: 'expense', label: 'Expense', value: 'expense' },
                    ]
                  : [
                      { key: 'due', label: 'Due', value: 'due' },
                      { key: 'paid', label: 'Paid', value: 'paid' },
                    ]
              }
            />
          </Form.Item>
          <Form.Item name="dateRange" className="!mb-0">
            <DatePicker.RangePicker className="w-full" />
          </Form.Item>
          <Form.Item name="sortOrder" className="!mb-0">
            <Radio.Group buttonStyle="solid" className="w-full text-center">
              <Radio.Button className="w-1/2" value="">
                ASC
              </Radio.Button>
              <Radio.Button className="w-1/2" value="DESC">
                DESC
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item className="!mb-0">
            <Space.Compact>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button
                type="primary"
                icon={<MdClear />}
                onClick={() => {
                  setDrawerOpen(false);
                  formInstance.resetFields();

                  const params = Toolbox.toCleanObject({
                    ...Object.fromEntries(searchParams.entries()),
                    ...formInstance.getFieldsValue(),
                    startDate: null,
                    endDate: null,
                  });
                  const queryString = new URLSearchParams(params).toString();

                  router.push(`?${queryString}`);
                }}
                danger
                ghost
              >
                Clear
              </Button>
            </Space.Compact>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default LedgerFilter;