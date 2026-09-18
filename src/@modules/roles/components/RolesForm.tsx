import FloatInput from '@base/antd/components/FloatInput';
import { Button, Col, Form, FormInstance, Radio, Row, message } from 'antd';
import React, { useEffect } from 'react';
import { IRoleCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IRoleCreate>;
  onFinish: (values: IRoleCreate) => void;
  backendError?: string | null;
}

const RolesForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, backendError }) => {
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
            name="title"
            rules={[
              {
                required: true,
                message: 'Title is required!',
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="Title" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item name="isActive" className="!mb-0">
            <Radio.Group buttonStyle="solid" className="w-full text-center">
              <Radio.Button className="w-1/2" value={true}>
                Active
              </Radio.Button>
              <Radio.Button className="w-1/2" value={false}>
                Inactive
              </Radio.Button>
            </Radio.Group>
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

export default RolesForm;
