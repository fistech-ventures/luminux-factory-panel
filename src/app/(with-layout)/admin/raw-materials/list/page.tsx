'use client';

import BaseSearch from '@base/components/BaseSearch';
import ActionMenu from '@base/components/ActionMenu';
import ConfirmationDialog from '@base/components/ConfirmationDialog';
import CustomUploader from '@base/components/CustomUploader';
import PageHeader from '@base/components/PageHeader';
import RecordDetailsModal from '@base/components/RecordDetailsModal';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { RawMaterialsHooks } from '@modules/raw-materials/lib/hooks';
import { IRawMaterial, IRawMaterialCreate, IRawMaterialsFilter } from '@modules/raw-materials/lib/interfaces';
import { Button, Col, Drawer, Form, Image, Input, InputNumber, Row, Space, Table, Tag, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { AiFillDelete, AiFillEdit, AiOutlineEye } from 'react-icons/ai';
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
  const [detailsItem, setDetailsItem] = useState<IRawMaterial | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });
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
    { title: 'Warranty', dataIndex: 'warranty', render: (warranty) => warranty || 'N/A' },
    {
      title: 'Combinations',
      dataIndex: 'combinations',
      render: (combinations: IRawMaterial['combinations']) => combinations?.length ?? 0,
    },
    { title: 'Stock', dataIndex: 'stock', render: (stock, record) => `${Number(stock ?? 0)} ${record.unit ?? ''}` },
    { title: 'Sold', dataIndex: 'saleQuantity', render: (saleQuantity) => saleQuantity ?? 0 },
    {
      title: 'Actions',
      render: (_, record) => (
        <ActionMenu
          content={
            <div className="flex flex-col gap-1">
              <Authorization allowedAccess={['products:read']}>
                <Button title="View details" onClick={() => setDetailsItem(record)}>
                  <AiOutlineEye />
                </Button>
              </Authorization>
              <Authorization allowedAccess={['products:write']}>
                <Button
                  title="Edit raw material"
                  onClick={() => {
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
                  }}
                >
                  <AiFillEdit />
                </Button>
                <Button
                  title="Delete raw material"
                  danger
                  onClick={() => setConfirmationDialog({
                    open: true,
                    title: 'Delete Raw Material',
                    content: `Are you sure you want to delete "${record.title}"?`,
                    onConfirm: () => {
                      remove.mutate(record.id);
                      setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                    },
                  })}
                >
                  <AiFillDelete />
                </Button>
              </Authorization>
            </div>
          }
        />
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
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="rawMaterial"
        id={detailsItem?.id}
        title={`Raw Material Details - ${detailsItem?.title ?? ''}`}
      />
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} })}
      />
      <Drawer width={560} title={editing ? `Update ${editing.title}` : 'Add raw material'} open={open} onClose={closeDrawer}>
        <Form
          form={form}
          size="large"
          layout="vertical"
          onFinish={(values) => editing ? update.mutate({ id: editing.id, data: values }) : create.mutate(values)}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="image" label="Image">
                <CustomUploader
                  maxCount={1}
                  listType="picture-card"
                  acceptedTypes={['jpg', 'jpeg', 'png', 'webp', 'avif']}
                  initialValues={editing?.image ? [editing.image] : []}
                  onChange={(urls) => form.setFieldValue('image', urls?.[0])}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="unit" label="Unit"><Input placeholder="kg, meter, pcs" /></Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="warranty" label="Warranty"><Input /></Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="sourcingPrice" label="Sourcing price"><InputNumber min={0} precision={2} disabled={combinations.length > 0} className="w-full" /></Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="sellingPrice" label="Selling price"><InputNumber min={0} precision={2} disabled={combinations.length > 0} className="w-full" /></Form.Item>
            </Col>
            {combinations.length === 0 && (
              <Col xs={24}>
                <Form.Item name="stock" label="Opening stock"><InputNumber min={0} precision={3} className="w-full" /></Form.Item>
              </Col>
            )}
          </Row>
          <Form.List name="combinations">
            {(fields, { add, remove }) => (
              <Space direction="vertical" className="w-full" size="middle">
                <h3>Combinations</h3>
                {fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-1 gap-2 border border-gray-200 p-3 md:grid-cols-2">
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
          <Button type="primary" htmlType="submit" loading={create.isPending || update.isPending} className="mt-2">Save</Button>
        </Form>
      </Drawer>
    </>
  );
};

export default WithAuthorization(RawMaterialsPage, { allowedAccess: ['products:read'] });