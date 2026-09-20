import FloatInput from "@base/antd/components/FloatInput";
import InputPhone from "@base/components/InputPhone";
import { ENUM_CUSTOMER_TYPES } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import { Button, Col, Form, FormInstance, Row, Select, message } from "antd";
import React, { useEffect } from "react";
import { ICustomerCreate } from "../lib/interfaces";

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: Partial<ICustomerCreate>;
  onFinish: (values: ICustomerCreate) => void;
  backendError?: string | null;
}

const CustomersForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = "create",
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
      const errorMessage = firstErrorField.errors[0];

      messageApi.warning(`${errorMessage}`);

      form.scrollToField(firstErrorField.name, {
        behavior: "smooth",
        block: "center",
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
        initialValues={{
          ...initialValues,
          customerType: initialValues?.customerType || "B2B",
        }}
        onFinish={(values) => onFinish(formType === "update" ? Toolbox.pickTouchedFields(form, values) : values)}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: "${label} is required!",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="customerType"
              rules={[
                { required: true, message: "Customer type is required!" },
              ]}
              className="mb-0!"
            >
              <Select
                placeholder="Customer Type"
                options={ENUM_CUSTOMER_TYPES.map((type) => ({
                  value: type,
                  label: type,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Name is required!" }]}
              className="mb-0!"
            >
              <FloatInput placeholder="Name" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="contactNumber"
              rules={[
                { required: true, message: "Contact number is required!" },
              ]}
              className="mb-0!"
            >
              <InputPhone placeholder="Contact Number" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="email"
              rules={[{ type: "email", message: "Email is not valid!" }]}
              className="mb-0!"
            >
              <FloatInput placeholder="Email" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="address" className="!mb-0">
              <FloatInput placeholder="Address" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="companyName" className="!mb-0">
              <FloatInput placeholder="Company Name" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item className="text-right !mb-0">
              <Button loading={isLoading} type="primary" htmlType="submit">
                {formType === "create" ? "Submit" : "Update"}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default CustomersForm;
