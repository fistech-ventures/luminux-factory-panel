import FloatInput from '@base/antd/components/FloatInput';
import { Button, Col, Form, FormInstance, Row, message } from 'antd';
import React, { useEffect } from 'react';
import { IGalleryCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IGalleryCreate>;
  onFinish: (values: IGalleryCreate) => void;
  backendError?: string | null;
}

const GalleryForm: React.FC<IProps> = ({ isLoading, form, formType = 'update', initialValues, onFinish, backendError }) => {
  const [messageApi, messageHolder] = message.useMessage();

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
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="title" className="!mb-0">
              <FloatInput placeholder="Title" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="caption" className="!mb-0">
              <FloatInput placeholder="Caption" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="source" className="!mb-0">
              <FloatInput placeholder="Source" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="altText" className="!mb-0">
              <FloatInput placeholder="Alt Text" />
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

export default GalleryForm;