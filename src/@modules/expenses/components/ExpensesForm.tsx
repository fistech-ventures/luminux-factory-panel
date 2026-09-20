import FloatInput from "@base/antd/components/FloatInput";
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { IExpenseCreate } from "../lib/interfaces";
import { ENUM_PAYMENT_METHODS } from "@lib/constant";
import { Toolbox } from "@lib/utils";

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: Partial<IExpenseCreate>;
  onFinish: (values: IExpenseCreate) => void;
  backendError?: string | null;
}

const ExpensesForm: React.FC<IProps> = ({
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
          date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
          paymentMethod: initialValues?.paymentMethod || "cash",
        }}
        onFinish={(values) => {
          const submittedValues = { ...values, date: dayjs(values.date).format("YYYY-MM-DD") };
          onFinish(formType === "update" ? Toolbox.pickTouchedFields(form, submittedValues) : submittedValues);
        }}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: "${label} is required!",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12}>
            <Form.Item
              name="date"
              rules={[{ required: true, message: "Date is required!" }]}
              className="mb-0!"
            >
              <DatePicker className="w-full" placeholder="Date" />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="paymentMethod"
              rules={[
                { required: true, message: "Payment method is required!" },
              ]}
              className="mb-0!"
            >
              <Select
                placeholder="Payment Method"
                options={ENUM_PAYMENT_METHODS.map((method) => ({
                  value: method,
                  label: method,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="purpose"
              rules={[{ required: true, message: "Purpose is required!" }]}
              className="mb-0!"
            >
              <FloatInput placeholder="Purpose" />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="amountSpent"
              rules={[{ required: true, message: "Amount spent is required!" }]}
              className="mb-0!"
            >
              <InputNumber
                className="w-full!"
                placeholder="Amount Spent"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="spentBy"
              rules={[{ required: true, message: "Spent by is required!" }]}
              className="mb-0!"
            >
              <FloatInput placeholder="Spent By (name)" />
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

export default ExpensesForm;
