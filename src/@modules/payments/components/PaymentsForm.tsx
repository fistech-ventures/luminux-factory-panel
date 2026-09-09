import { ENUM_PAYMENT_METHODS } from '@lib/constant';
import { IPaymentCreate } from '@modules/payments/lib/interfaces';
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const PAYMENT_METHODS = ENUM_PAYMENT_METHODS as readonly string[];

interface IProps {
  form: any;
  initialValues?: Partial<IPaymentCreate>;
  isLoading?: boolean;
  onFinish: (values: IPaymentCreate) => void;
}

const PaymentsForm: React.FC<IProps> = ({ form, initialValues, onFinish }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        paymentDate: initialValues?.paymentDate ? dayjs(initialValues.paymentDate) : dayjs(),
      }}
      onFinish={(values) => {
        onFinish({
          ...values,
          paymentDate: values.paymentDate ? values.paymentDate.toISOString() : new Date().toISOString(),
        });
      }}
    >
      <Form.Item
        name="entityType"
        label="Entity Type"
        rules={[{ required: true, message: 'Please select entity type' }]}
      >
        <Select placeholder="Select entity type">
          <Select.Option value="customer">Customer</Select.Option>
          <Select.Option value="supplier">Supplier</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="entityId"
        label="Entity ID"
        rules={[{ required: true, message: 'Please enter entity ID' }]}
      >
        <Input placeholder="Enter entity ID" />
      </Form.Item>

      <Form.Item
        name="amount"
        label="Amount"
        rules={[{ required: true, message: 'Please enter amount' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Enter amount"
          min={0}
          precision={2}
        />
      </Form.Item>

      <Form.Item
        name="paymentMethod"
        label="Payment Method"
        rules={[{ required: true, message: 'Please select payment method' }]}
      >
        <Select placeholder="Select payment method">
          {PAYMENT_METHODS.map((method) => (
            <Select.Option key={method} value={method}>
              {method}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="paymentDate"
        label="Payment Date"
        rules={[{ required: true, message: 'Please select payment date' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="referenceType" label="Reference Type">
        <Select placeholder="Select reference type" allowClear>
          <Select.Option value="sale">Sale</Select.Option>
          <Select.Option value="purchase">Purchase</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="referenceId" label="Reference ID">
        <Input placeholder="Enter reference ID" />
      </Form.Item>

      <Form.Item name="note" label="Note">
        <Input.TextArea rows={3} placeholder="Enter note" />
      </Form.Item>
    </Form>
  );
};

export default PaymentsForm;
