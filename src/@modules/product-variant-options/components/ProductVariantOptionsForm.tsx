import FloatInput from '@base/antd/components/FloatInput';
import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import { Toolbox } from '@lib/utils';
import { ProductsHooks } from '@modules/products/lib/hooks';
import { IProduct } from '@modules/products/lib/interfaces';
import { VariantsHooks } from '@modules/variants/lib/hooks';
import { IVariant } from '@modules/variants/lib/interfaces';
import { Button, Col, Form, FormInstance, InputNumber, Row, Select, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { IProductVariantOptionCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: any;
  onFinish: (values: IProductVariantOptionCreate) => void;
  backendError?: string | null;
}

const ProductVariantOptionsForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = 'create',
  initialValues,
  onFinish,
  backendError,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [productSearchTerm, setProductSearchTerm] = useState(null);
  const [variantSearchTerm, setVariantSearchTerm] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(null);

  useEffect(() => {
    if (backendError) {
      messageApi.error(backendError);
    }
  }, [backendError, messageApi]);

  useEffect(() => {
    setSelectedVariantId((initialValues?.variantId as string) ?? null);
  }, [form, initialValues]);

  const handleFinishFailed = (errorInfo: any) => {
    const { errorFields } = errorInfo;
    if (errorFields && errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const errorMessage = firstErrorField.errors[0];

      messageApi.warning(`${errorMessage}`);

      form.scrollToField(firstErrorField.name, {
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const productsQuery = ProductsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: productSearchTerm,
    },
  });

  const variantsQuery = VariantsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: variantSearchTerm,
    },
  });

  const variantOptions = variantsQuery.data?.pages
    ?.flatMap((page) => page?.data ?? [])
    ?.find((variant: IVariant) => variant.id === selectedVariantId)?.options;

  return (
    <React.Fragment>
      {messageHolder}
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={initialValues}
        onFinish={onFinish}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: '${label} is required!',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="productId"
              rules={[{ required: true, message: 'Product is required!' }]}
              className="!mb-0"
            >
              <InfiniteScrollSelect<IProduct>
                showSearch
                allowClear
                virtual={false}
                placeholder="Product"
                initialOptions={initialValues?.product ? [initialValues.product] : []}
                option={({ item: product }) => ({
                  key: product?.id,
                  label: `${product?.title} (${product?.productCode})`,
                  value: product?.id,
                })}
                onChangeSearchTerm={(searchTerm) => setProductSearchTerm(searchTerm)}
                query={productsQuery}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="variantId"
              rules={[{ required: true, message: 'Variant is required!' }]}
              className="!mb-0"
            >
              <InfiniteScrollSelect<IVariant>
                showSearch
                allowClear
                virtual={false}
                placeholder="Variant (e.g. Color, Size)"
                option={({ item: variant }) => ({
                  key: variant?.id,
                  label: variant?.title,
                  value: variant?.id,
                })}
                onChangeSearchTerm={(searchTerm) => setVariantSearchTerm(searchTerm)}
                query={variantsQuery}
                onChange={(id) => {
                  setSelectedVariantId(id);
                  form.setFieldValue('variantOptionId', null);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="variantOptionId"
              rules={[{ required: true, message: 'Variant option is required!' }]}
              className="!mb-0"
            >
              <Select
                showSearch
                allowClear
                placeholder="Variant Option (e.g. Red, XL)"
                options={Toolbox.toCleanArray(
                  variantOptions?.map((option) => ({
                    key: option?.id,
                    label: option?.title,
                    value: option?.id,
                  })),
                )}
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="sku" className="!mb-0">
              <FloatInput placeholder="SKU" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="sellingPrice" className="!mb-0">
              <InputNumber className="w-full" placeholder="Selling Price" min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="stockQuantity" className="!mb-0">
              <InputNumber className="w-full" placeholder="Stock Quantity" min={0} precision={0} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="position" className="!mb-0">
              <InputNumber className="w-full" placeholder="Position" min={0} precision={0} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item className="text-right !mb-0">
              <Button loading={isLoading} type="primary" htmlType="submit">
                {formType === 'create' ? 'Submit' : 'Update'}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default ProductVariantOptionsForm;