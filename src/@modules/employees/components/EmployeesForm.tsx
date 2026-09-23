import FloatInput from '@base/antd/components/FloatInput';
import InputPhone from '@base/components/InputPhone';
import { Toolbox } from '@lib/utils';
import { Button, Col, Form, FormInstance, Row, message } from 'antd';
import React, { useEffect } from 'react';
import { IEmployeeCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IEmployeeCreate>;
  onFinish: (values: IEmployeeCreate) => void;
  backendError?: string | null;
}

const EmployeesForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = 'create',
  initialValues,
  onFinish,
  backendError,
}) => {
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
      messageApi.warning(`${firstErrorField.errors[0]}`);

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
        initialValues={{ ...initialValues }}
        onFinish={(values) =>
          onFinish(formType === 'update' ? Toolbox.pickTouchedFields(form, values) : values)
        }
        onFinishFailed={handleFinishFailed}
        validateMessages={{ required: '${label} is required!' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Name is required!' }]}
              className="mb-0!"
            >
              <FloatInput placeholder="Name" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="employeeId"
              rules={[{ required: true, message: 'Employee ID is required!' }]}
              className="mb-0!"
            >
              <FloatInput placeholder="Employee ID (e.g. EMP-001)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="phoneNumber"
              rules={[{ required: true, message: 'Phone number is required!' }]}
              className="mb-0!"
            >
              <InputPhone placeholder="Phone Number" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="email"
              rules={[{ type: 'email', message: 'Email is not valid!' }]}
              className="mb-0!"
            >
              <FloatInput placeholder="Email (optional)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="designation" className="!mb-0">
              <FloatInput placeholder="Designation (optional)" />
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

export default EmployeesForm;
