import FloatInput from '@base/antd/components/FloatInput';
import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import { Toolbox } from '@lib/utils';
import { EmployeesHooks } from '@modules/employees/lib/hooks';
import { IEmployee } from '@modules/employees/lib/interfaces';
import { Button, Col, DatePicker, Form, FormInstance, InputNumber, Row, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { IInvestment, IInvestmentCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<Omit<IInvestmentCreate, 'createdBy'>> & {
    investor?: IInvestment['investor'];
    createdBy?: IInvestment['createdBy'];
  };
  onFinish: (values: IInvestmentCreate) => void;
  backendError?: string | null;
}

const InvestmentsForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = 'create',
  initialValues,
  onFinish,
  backendError,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState(null);
  const employeesQuery = EmployeesHooks.useFindInfinite({
    options: { limit: 20, searchTerm: employeeSearchTerm },
  });

  useEffect(() => {
    if (backendError) messageApi.error(backendError);
  }, [backendError, messageApi]);

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
        }}
        onFinish={(values) => {
          const submittedValues = {
            ...values,
            date: dayjs(values.date).format('YYYY-MM-DD'),
          };
          onFinish(formType === 'update' ? Toolbox.pickTouchedFields(form, submittedValues) : submittedValues);
        }}
        validateMessages={{ required: '${label} is required!' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="date" rules={[{ required: true, message: 'Date is required!' }]} className="mb-0!">
              <DatePicker className="w-full" placeholder="Investment Date" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="mb-0!">
              <FloatInput placeholder="Investment Title" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="investorId" rules={[{ required: true, message: 'Investor is required!' }]} className="mb-0!">
              <InfiniteScrollSelect<IEmployee>
                showSearch
                allowClear
                placeholder="Investor (Employee)"
                initialOptions={initialValues?.investor ? [initialValues.investor as IEmployee] : []}
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
            <Form.Item name="amount" rules={[{ required: true, message: 'Amount is required!' }]} className="mb-0!">
              <InputNumber className="w-full!" min={0} precision={2} placeholder="Investment Amount" />
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

export default InvestmentsForm;
