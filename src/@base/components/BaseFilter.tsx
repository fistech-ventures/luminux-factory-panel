'use client';

import { Toolbox } from '@lib/utils';
import { Button, DatePicker, Drawer, Form, Radio, Space } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';

interface IProps {
  initialValues: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  /** Extra form items rendered inside the filter drawer */
  extra?: React.ReactNode;
  /** Show the isActive radio group (All / Active / Inactive) */
  showIsActive?: boolean;
  /** Show the date range picker (maps to startDate / endDate YYYY-MM-DD) */
  showDateRange?: boolean;
}

const BaseFilter: React.FC<IProps> = ({
  initialValues,
  onChange,
  extra,
  showIsActive = true,
  showDateRange = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    formInstance.resetFields();

    const values: Record<string, any> = {
      isActive: '',
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

  const handleSubmitFn = (values: Record<string, any>) => {
    values.startDate = values?.dateRange?.length ? dayjs(values?.dateRange?.[0]).format('YYYY-MM-DD') : null;
    values.endDate = values?.dateRange?.length ? dayjs(values?.dateRange?.[1]).format('YYYY-MM-DD') : null;

    delete values.dateRange;

    onChange(Toolbox.toCleanObject({ ...values, page: 1 }));
    setDrawerOpen(false);
  };

  const handleClearFn = () => {
    setDrawerOpen(false);
    formInstance.resetFields();

    const params = Toolbox.toCleanObject({
      searchTerm: searchParams.get('searchTerm'),
      limit: searchParams.get('limit'),
      page: 1,
    });
    const queryString = new URLSearchParams(params).toString();

    router.push(`?${queryString}`);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-end mb-4">
      <Button type="primary" icon={<FaFilter />} onClick={() => setDrawerOpen(true)} ghost>
        Filter
      </Button>
      <Drawer width={380} title="Filter" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <Form form={formInstance} onFinish={handleSubmitFn} className="flex flex-col gap-3">
          {showDateRange && (
            <Form.Item name="dateRange" className="!mb-0">
              <DatePicker.RangePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          )}
          {showIsActive && (
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
          )}
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
          {extra}
          <Form.Item className="!mb-0">
            <Space.Compact>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button type="primary" icon={<MdClear />} onClick={handleClearFn} danger ghost>
                Clear
              </Button>
            </Space.Compact>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default BaseFilter;