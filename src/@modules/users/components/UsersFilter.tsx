import { Toolbox } from '@lib/utils';
import { RolesHooks } from '@modules/roles/lib/hooks';
import { Button, DatePicker, Drawer, Form, Radio, Select, Space } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';
import { IUsersFilter } from '../lib/interfaces';

interface IProps {
  initialValues: IUsersFilter;
  onChange: (values: IUsersFilter) => void;
}

const UsersFilter: React.FC<IProps> = ({ initialValues, onChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const rolesQuery = RolesHooks.useFind({
    options: {
      page: 1,
      limit: 300,
    },
  });

  useEffect(() => {
    formInstance.resetFields();

    const values: Record<string, any> = {
      isActive: '',
      sortOrder: '',
      dateRange: [],
      ...initialValues,
    };

    if (values?.roles) {
      try {
        values.roles = JSON.parse(values.roles);
      } catch {
        values.roles = [];
      }
    }

    if (values?.startDate && values?.endDate) {
      values.dateRange.push(dayjs(values.startDate));
      values.dateRange.push(dayjs(values.endDate));

      delete values.startDate;
      delete values.endDate;
    }

    formInstance.setFieldsValue(values);
  }, [formInstance, initialValues]);

  return (
    <div className="flex flex-wrap gap-3 justify-end mb-4">
      <Button type="primary" icon={<FaFilter />} onClick={() => setDrawerOpen(true)} ghost>
        Filter
      </Button>
      <Drawer width={380} title="Filter" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <Form
          form={formInstance}
          onFinish={(values) => {
            values.startDate = values?.dateRange?.length ? dayjs(values?.dateRange?.[0]).format('YYYY-MM-DD') : null;
            values.endDate = values?.dateRange?.length ? dayjs(values?.dateRange?.[1]).format('YYYY-MM-DD') : null;
            values.roles = values?.roles?.length ? JSON.stringify(values.roles) : null;

            delete values.dateRange;
            onChange(Toolbox.toCleanObject(values));
            setDrawerOpen(false);
          }}
          className="flex flex-col gap-3"
        >
          <Form.Item name="roles" className="!mb-0">
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Roles"
              options={Toolbox.toCleanArray(
                rolesQuery.data?.data?.map((role) => ({
                  key: role?.id,
                  label: role?.title,
                  value: role?.title,
                })),
              )}
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="dateRange" className="!mb-0">
            <DatePicker.RangePicker className="w-full" />
          </Form.Item>
          <Form.Item name="isActive" className="!mb-0">
            <Radio.Group buttonStyle="solid" className="w-full text-center">
              <Radio.Button className="w-1/3" value="">
                All
              </Radio.Button>
              <Radio.Button className="w-1/3" value="true">
                Active
              </Radio.Button>
              <Radio.Button className="w-1/3" value="false">
                Inactive
              </Radio.Button>
            </Radio.Group>
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

export default UsersFilter;