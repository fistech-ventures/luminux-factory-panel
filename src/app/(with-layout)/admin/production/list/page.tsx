'use client';

import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import BaseSearch from '@base/components/BaseSearch';
import CustomUploader from '@base/components/CustomUploader';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { ProductsHooks } from '@modules/products/lib/hooks';
import { IProduct } from '@modules/products/lib/interfaces';
import { ProductionHooks } from '@modules/production/lib/hooks';
import { IProductionCreate, IProductionFilter } from '@modules/production/lib/interfaces';
import { RawMaterialsHooks } from '@modules/raw-materials/lib/hooks';
import { IRawMaterial } from '@modules/raw-materials/lib/interfaces';
import { Button, Col, Drawer, Form, Input, InputNumber, Radio, Row, Select, Space, Table, Tag, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const ProductionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const { page = 1, limit = 20, ...filters } = Toolbox.parseQueryParams<IProductionFilter>(`?${searchParams.toString()}`);
  const history = ProductionHooks.useFindInfinite({ options: { ...filters, page, limit } });
  const create = ProductionHooks.useCreate({
    config: {
      onSuccess: (response) => {
        if (!response.success) return messageApi.error(response.message);
        messageApi.success(response.message);
        form.resetFields();
        setOpen(false);
      },
    },
  });
  const productsQuery = ProductsHooks.useFindInfinite({ options: { limit: 20, searchTerm: productSearch } });
  const materialsQuery = RawMaterialsHooks.useFindInfinite({ options: { limit: 20, searchTerm: materialSearch } });
  const loadedRawMaterials = materialsQuery.data?.pages.flatMap((result) => result.data ?? []) ?? [];
  const watchedMaterials = Form.useWatch('usedRawMaterials', form) ?? [];
  const getMaterialCombinations = (rawMaterialId?: string) =>
    loadedRawMaterials.find((material) => material.id === rawMaterialId)?.combinations ?? [];
  const rows = history.data?.pages.flatMap((result) => result.data ?? []) ?? [];
  const productMode = Form.useWatch('productMode', form) ?? 'existing';

  const columns: TableColumnsType<(typeof rows)[number]> = [
    { title: 'Finished product', dataIndex: ['product', 'title'] },
    { title: 'Type', dataIndex: 'isNewProduct', render: (value) => value ? 'New product' : 'Existing product' },
    { title: 'Quantity produced', dataIndex: 'quantity' },
    { title: 'Production cost', dataIndex: 'totalProductionCost', render: (value) => Number(value ?? 0).toFixed(2) },
    { title: 'Cost per unit', dataIndex: 'productionCostPerUnit', render: (value) => Number(value ?? 0).toFixed(2) },
    {
      title: 'Raw materials',
      dataIndex: 'usedRawMaterials',
      render: (used: Array<{ title: string; combinationTitle?: string; quantity: number; unit?: string }>) =>
        used?.map((material) => `${material.title}${material.combinationTitle ? ` / ${material.combinationTitle}` : ''}: ${material.quantity} ${material.unit ?? ''}`).join(', '),
    },
    { title: 'Date', dataIndex: 'createdAt', render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
  ];

  const submit = (values: any) => {
    const payload: IProductionCreate = {
      quantity: Number(values.quantity),
      otherCost: Number(values.otherCost) || 0,
      usedRawMaterials: (values.usedRawMaterials ?? []).map((material: any) => ({
        rawMaterialId: material.rawMaterialId,
        rawMaterialCombinationId: material.rawMaterialCombinationId,
        quantity: Number(material.quantity),
      })),
      ...(values.productMode === 'new'
        ? {
            newProduct: {
              title: values.title,
              productCode: values.productCode,
              description: values.description,
              warranty: values.warranty,
              unit: values.unit,
              thumbnail: values.thumbnail,
              sellingPrice: values.sellingPrice,
            },
          }
        : { productId: values.productId }),
    };
    create.mutate(payload);
  };

  return (
    <>
      {messageHolder}
      <PageHeader
        title="Production"
        subTitle={<BaseSearch />}
        tags={[<Tag key="total">Runs: {history.data?.pages[0]?.meta?.total ?? 0}</Tag>]}
        extra={<Authorization allowedAccess={['products:write']}><Button type="primary" onClick={() => { form.resetFields(); setOpen(true); }}>Record production</Button></Authorization>}
      />
      <Table
        rowKey="id"
        loading={history.isLoading}
        dataSource={rows}
        columns={columns}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize: limit,
          total: history.data?.pages[0]?.meta?.total,
          showSizeChanger: true,
          onChange: (nextPage, nextLimit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page: nextPage, limit: nextLimit });
            router.push(`?${new URLSearchParams(params).toString()}`);
          },
        }}
      />
      <Drawer width={720} title="Record production" open={open} onClose={() => setOpen(false)}>
        <Form form={form} size="large" layout="vertical" initialValues={{ productMode: 'existing', usedRawMaterials: [{}] }} onFinish={submit}>
          <Form.Item name="productMode" label="Finished product">
            <Radio.Group buttonStyle="solid" onChange={() => form.setFieldValue('productId', undefined)}>
              <Radio.Button value="existing">Existing product</Radio.Button>
              <Radio.Button value="new">New product</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {productMode === 'existing' ? (
            <Form.Item name="productId" rules={[{ required: true, message: 'Select a finished product' }]}>
              <InfiniteScrollSelect<IProduct>
                showSearch
                virtual={false}
                placeholder="Finished product"
                option={({ item }) => ({ key: item.id, value: item.id, label: `${item.title} (${item.productCode})` })}
                onChangeSearchTerm={setProductSearch}
                query={productsQuery}
              />
            </Form.Item>
          ) : (
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}><Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="productCode" label="Product code" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="unit" label="Unit"><Input /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="warranty" label="Warranty"><Input /></Form.Item></Col>
              <Col xs={24}><Form.Item name="thumbnail" label="Image">
                <CustomUploader
                  maxCount={1}
                  listType="picture-card"
                  acceptedTypes={['jpg', 'jpeg', 'png', 'webp', 'avif']}
                  onChange={(urls) => form.setFieldValue('thumbnail', urls?.[0])}
                />
              </Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="sellingPrice" label="Selling price"><InputNumber min={0} precision={2} className="w-full" /></Form.Item></Col>
              <Col xs={24}><Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item></Col>
            </Row>
          )}
          <Row gutter={12}>
            <Col span={12}><Form.Item name="quantity" label="Quantity produced" rules={[{ required: true }]}><InputNumber min={0.001} precision={3} className="w-full" /></Form.Item></Col>
            <Col span={12}><Form.Item name="otherCost" label="Other cost"><InputNumber min={0} precision={2} className="w-full" /></Form.Item></Col>
          </Row>
          <Form.List name="usedRawMaterials">
            {(fields, { add, remove }) => (
              <Space direction="vertical" className="w-full" size="middle">
                <h3>Raw materials used</h3>
                {fields.map((field) => (
                  <Row key={field.key} gutter={8} align="top">
                    <Col flex="auto">
                      <Form.Item {...field} name={[field.name, 'rawMaterialId']} rules={[{ required: true }]}>
                        <InfiniteScrollSelect<IRawMaterial>
                          showSearch
                          virtual={false}
                          placeholder="Raw material"
                          option={({ item }) => ({ key: item.id, value: item.id, label: `${item.title} (${item.stock} ${item.unit ?? ''} available)` })}
                          onChange={(rawMaterialId) => {
                            const materials = [...(form.getFieldValue('usedRawMaterials') ?? [])];
                            materials[field.name] = {
                              ...materials[field.name],
                              rawMaterialId,
                              rawMaterialCombinationId: undefined,
                            };
                            form.setFieldsValue({ usedRawMaterials: materials });
                          }}
                          onChangeSearchTerm={setMaterialSearch}
                          query={materialsQuery}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'rawMaterialCombinationId']}
                        rules={getMaterialCombinations(watchedMaterials[field.name]?.rawMaterialId).length
                          ? [{ required: true, message: 'Select a raw-material combination' }]
                          : []}
                      >
                        <Select
                          disabled={!getMaterialCombinations(watchedMaterials[field.name]?.rawMaterialId).length}
                          placeholder={getMaterialCombinations(watchedMaterials[field.name]?.rawMaterialId).length
                            ? 'Raw-material combination'
                            : 'No combinations configured'}
                          options={getMaterialCombinations(watchedMaterials[field.name]?.rawMaterialId).map((combination) => ({
                            value: combination.id,
                            label: `${combination.title}${combination.code ? ` (${combination.code})` : ''} - ${combination.stock} ${combination.unit ?? ''}`,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col flex="180px">
                      <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                        <InputNumber min={0.001} precision={3} placeholder="Quantity used" className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col><Button danger onClick={() => remove(field.name)}>Remove</Button></Col>
                  </Row>
                ))}
                <Button onClick={() => add({})}>Add raw material</Button>
              </Space>
            )}
          </Form.List>
          <Button className="mt-6" type="primary" htmlType="submit" loading={create.isPending}>Save production</Button>
        </Form>
      </Drawer>
    </>
  );
};

export default WithAuthorization(ProductionPage, { allowedAccess: ['products:read'] });