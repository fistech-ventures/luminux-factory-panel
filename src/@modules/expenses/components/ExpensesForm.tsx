import FloatInput from "@base/antd/components/FloatInput";
import InfiniteScrollSelect from "@base/components/InfiniteScrollSelect";
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
import React, { useEffect, useState } from "react";
import { IExpenseCreate } from "../lib/interfaces";
import { ENUM_PAYMENT_METHODS } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import { EmployeesHooks } from "@modules/employees/lib/hooks";
import { IEmployee } from "@modules/employees/lib/interfaces";

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
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState(null);

  const employeesQuery = EmployeesHooks.useFindInfinite({
    options: { limit: 20, searchTerm: employeeSearchTerm },
    config: { queryKey: [] },
  });

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
              <DatePicker className="w-full" placeholder="Date" format="DD/MM/YYYY" />
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
            <Form.Item name="spentBy" className="mb-0!">
              <FloatInput placeholder="Spent By (auto-filled for employees)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="employeeId"
              className="mb-0!"
              extra="Link this expense to an employee. It is then settled from their advance and will not reduce the company balance."
            >
              <InfiniteScrollSelect<IEmployee>
                showSearch
                allowClear
                placeholder="Employee (optional)"
                option={({ item }) => ({
                  key: item.id,
                  value: item.id,
                  label: `${item.name} (${item.employeeId})`,
                })}
                onChangeSearchTerm={setEmployeeSearchTerm}
                query={employeesQuery}
              />
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
