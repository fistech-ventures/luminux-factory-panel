import FloatInput from '@base/antd/components/FloatInput';
import { Toolbox } from '@lib/utils';
import { CustomersHooks } from '@modules/customers/lib/hooks';
import { SuppliersHooks } from '@modules/suppliers/lib/hooks';
import { Button, Col, DatePicker, Form, FormInstance, InputNumber, Radio, Row, Select, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { ILedgerCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<ILedgerCreate>;
  onFinish: (values: ILedgerCreate) => void;
  backendError?: string | null;
}

const LedgerForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, backendError }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const entityType = Form.useWatch('entityType', form) || initialValues?.entityType || 'customer';

  useEffect(() => {
    if (backendError) {
      messageApi.error(backendError);
    }
  }, [backendError, messageApi]);

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

  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

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

  const entityOptions =
    entityType === 'supplier'
      ? suppliersQuery.data?.data?.map((supplier) => ({
          key: supplier?.id,
          label: supplier?.companyName,
          value: supplier?.id,
        }))
      : customersQuery.data?.data?.map((customer) => ({
          key: customer?.id,
          label: customer?.name,
          value: customer?.id,
        }));

  return (
    <React.Fragment>
      {messageHolder}
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={{
          ...initialValues,
          transactionDate: initialValues?.transactionDate ? dayjs(initialValues.transactionDate) : dayjs(),
        }}
        onFinish={(values) =>
          onFinish({
            ...values,
            transactionDate: dayjs(values.transactionDate).format('YYYY-MM-DD'),
          })
        }
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: '${label} is required!',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="entityType" rules={[{ required: true, message: 'Entity type is required!' }]} className="!mb-0">
              <Radio.Group buttonStyle="solid" className="w-full text-center">
                <Radio.Button className="w-1/2" value="customer">
                  Customer
                </Radio.Button>
                <Radio.Button className="w-1/2" value="supplier">
                  Supplier
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="entityId" rules={[{ required: true, message: 'Entity is required!' }]} className="!mb-0">
              <Select
                showSearch
                allowClear
                placeholder={entityType === 'supplier' ? 'Supplier' : 'Customer'}
                options={Toolbox.toCleanArray(entityOptions)}
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="type" rules={[{ required: true, message: 'Type is required!' }]} className="!mb-0">
              <Select
                placeholder="Type"
                options={[
                  { key: 'due', label: 'Due', value: 'due' },
                  { key: 'paid', label: 'Paid', value: 'paid' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="amount" rules={[{ required: true, message: 'Amount is required!' }]} className="!mb-0">
              <InputNumber className="w-full" placeholder="Amount" min={0} precision={2} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="transactionDate" rules={[{ required: true, message: 'Transaction date is required!' }]} className="!mb-0">
              <DatePicker className="w-full" placeholder="Transaction Date" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="description" className="!mb-0">
              <FloatInput placeholder="Description" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="referenceType" className="!mb-0">
              <FloatInput placeholder="Reference Type" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="referenceId" className="!mb-0">
              <FloatInput placeholder="Reference Id" />
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

export default LedgerForm;