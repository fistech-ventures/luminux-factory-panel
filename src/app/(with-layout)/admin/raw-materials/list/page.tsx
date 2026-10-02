'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { RawMaterialsHooks } from '@modules/raw-materials/lib/hooks';
import { IRawMaterial, IRawMaterialCreate, IRawMaterialsFilter } from '@modules/raw-materials/lib/interfaces';
import { Button, Drawer, Form, Image, Input, InputNumber, Space, Table, Tag, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { Toolbox } from '@lib/utils';

const RawMaterialsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [form] = Form.useForm<IRawMaterialCreate>();
  const combinations = Form.useWatch('combinations', form) ?? [];
  const [editing, setEditing] = useState<IRawMaterial | null>(null);
  const [open, setOpen] = useState(false);
  const { page = 1, limit = 20, ...filters } = Toolbox.parseQueryParams<IRawMaterialsFilter>(`?${searchParams.toString()}`);
  const query = RawMaterialsHooks.useFind({ options: { ...filters, page, limit } });

  const closeDrawer = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };
  const create = RawMaterialsHooks.useCreate({
    config: {
      onSuccess: (response) => {
        if (!response.success) return messageApi.error(response.message);
        messageApi.success(response.message);
        closeDrawer();
      },
    },
  });
  const update = RawMaterialsHooks.useUpdate({
    config: {
      onSuccess: (response) => {
        if (!response.success) return messageApi.error(response.message);
        messageApi.success(response.message);
        closeDrawer();
      },
    },
  });
  const remove = RawMaterialsHooks.useDelete({
    config: {
      onSuccess: (response) => response.success ? messageApi.success(response.message) : messageApi.error(response.message),
    },
  });

  const columns: TableColumnsType<IRawMaterial> = [
    { title: 'Image', dataIndex: 'image', render: (image: string) => image ? <Image src={image} alt="Raw material" width={48} height={48} className="object-cover" /> : 'N/A' },
    { title: 'Title', dataIndex: 'title' },
    { title: 'Unit', dataIndex: 'unit', render: (unit) => unit || 'N/A' },
    { title: 'Stock', dataIndex: 'stock', render: (stock, record) => `${Number(stock ?? 0)} ${record.unit ?? ''}` },
    {
      title: 'Combinations',
      dataIndex: 'combinations',
      render: (combinations: IRawMaterial['combinations']) =>
        combinations?.length ? combinations.map((combination) => combination.title).join(', ') : 'N/A',
    },
    { title: 'Sourcing price', dataIndex: 'sourcingPrice', render: (value) => Number(value ?? 0).toFixed(2) },
    { title: 'Selling price', dataIndex: 'sellingPrice', render: (value) => Number(value ?? 0).toFixed(2) },
    {
      title: 'Actions',
      render: (_, record) => (
        <Authorization allowedAccess={['products:write']}>
          <Space>
            <Button onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                title: record.title,
                description: record.description,
                unit: record.unit,
                warranty: record.warranty,
                sourcingPrice: record.sourcingPrice,
                sellingPrice: record.sellingPrice,
                image: record.image,
                stock: record.stock,
                combinations: record.combinations?.map((combination) => ({
                  id: combination.id,
                  title: combination.title,
                  code: combination.code,
                  unit: combination.unit,
                  sourcingPrice: combination.sourcingPrice,
                  sellingPrice: combination.sellingPrice,
                  stock: combination.stock,
                })) ?? [],
              });
              setOpen(true);
            }}>Edit</Button>
            <Button danger onClick={() => remove.mutate(record.id)}>Delete</Button>
          </Space>
        </Authorization>
      ),
    },
  ];

  return (
    <>
      {messageHolder}
      <PageHeader
        title="Raw Materials"
        subTitle={<BaseSearch />}
        tags={[<Tag key="total">Total: {query.data?.meta?.total ?? 0}</Tag>]}
        extra={<Authorization allowedAccess={['products:write']}><Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add raw material</Button></Authorization>}
      />
      <Table
        rowKey="id"
        loading={query.isLoading}
        dataSource={query.data?.data ?? []}
        columns={columns}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize: limit,
          total: query.data?.meta?.total,
          showSizeChanger: true,
          onChange: (nextPage, nextLimit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page: nextPage, limit: nextLimit });
            router.push(`?${new URLSearchParams(params).toString()}`);
          },
        }}
      />
      <Drawer width={560} title={editing ? `Update ${editing.title}` : 'Add raw material'} open={open} onClose={closeDrawer}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => editing ? update.mutate({ id: editing.id, data: values }) : create.mutate(values)}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="image" label="Image URL"><Input /></Form.Item>
          <Form.Item name="unit" label="Unit"><Input placeholder="kg, meter, pcs" /></Form.Item>
          <Form.Item name="warranty" label="Warranty"><Input /></Form.Item>
          <Form.Item name="sourcingPrice" label="Sourcing price"><InputNumber min={0} precision={2} disabled={combinations.length > 0} className="w-full" /></Form.Item>
          <Form.Item name="sellingPrice" label="Selling price"><InputNumber min={0} precision={2} disabled={combinations.length > 0} className="w-full" /></Form.Item>
          {combinations.length === 0 && <Form.Item name="stock" label="Opening stock"><InputNumber min={0} precision={3} className="w-full" /></Form.Item>}
          <Form.List name="combinations">
            {(fields, { add, remove }) => (
              <Space direction="vertical" className="w-full" size="middle">
                <h3>Combinations</h3>
                {fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-2 gap-2 border border-gray-200 p-3">
                    <Form.Item {...field} name={[field.name, 'title']} label="Name" rules={[{ required: true }]}>
                      <Input placeholder="e.g. 1.5 mm, Red" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'code']} label="Code">
                      <Input placeholder="Optional code" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'unit']} label="Unit">
                      <Input placeholder="Inherited if blank" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'stock']} label="Stock" rules={[{ required: true }]}>
                      <InputNumber min={0} precision={3} className="w-full" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'sourcingPrice']} label="Sourcing price" rules={[{ required: true }]}>
                      <InputNumber min={0} precision={2} className="w-full" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'sellingPrice']} label="Selling price" rules={[{ required: true }]}>
                      <InputNumber min={0} precision={2} className="w-full" />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>Remove combination</Button>
                  </div>
                ))}
                <Button onClick={() => add({ stock: 0, sourcingPrice: 0, sellingPrice: 0 })}>Add combination</Button>
              </Space>
            )}
          </Form.List>
          <Button type="primary" htmlType="submit" loading={create.isPending || update.isPending}>Save</Button>
        </Form>
      </Drawer>
    </>
  );
};

export default WithAuthorization(RawMaterialsPage, { allowedAccess: ['products:read'] });