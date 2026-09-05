import FloatInput from '@base/antd/components/FloatInput';
import { Toolbox } from '@lib/utils';
import { Button, Col, Divider, Form, FormInstance, Radio, Row, Space, message } from 'antd';
import React, { useEffect } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { IVariantCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IVariantCreate>;
  onFinish: (values: IVariantCreate) => void;
  backendError?: string | null;
}

const VariantsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, backendError }) => {
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
        initialValues={{
          ...initialValues,
          options: Toolbox.isNotEmpty(initialValues?.options) ? initialValues.options : [],
        }}
        onFinish={onFinish}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: '${label} is required!',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput placeholder="Title (e.g. Color, Size)" />
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
            <Divider orientation="left" plain>
              Options
            </Divider>
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <div className="flex flex-col gap-2">
                  {fields.map((field, idx) => (
                    <div key={field.key} className="border border-gray-200 rounded-lg p-3">
                      <Space.Compact block>
                        <Form.Item
                          {...field}
                          name={[field.name, 'title']}
                          rules={[{ required: true, message: 'Option title is required!' }]}
                          className="!mb-0 flex-1"
                        >
                          <FloatInput placeholder={`Option ${idx + 1} (e.g. Red, XL)`} />
                        </Form.Item>
                        <Button
                          type="text"
                          danger
                          icon={<MdOutlineDeleteOutline />}
                          onClick={() => remove(field.name)}
                        />
                      </Space.Compact>
                      <Form.Item
                        {...field}
                        name={[field.name, 'isActive']}
                        className="!mb-0 mt-2"
                        initialValue={true}
                      >
                        <Radio.Group buttonStyle="solid" size="small" className="w-full text-center">
                          <Radio.Button className="w-1/2" value={true}>
                            Active
                          </Radio.Button>
                          <Radio.Button className="w-1/2" value={false}>
                            Inactive
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                      {formType === 'update' && (
                        <Form.Item {...field} name={[field.name, 'id']} className="!mb-0 hidden">
                          <FloatInput />
                        </Form.Item>
                      )}
                    </div>
                  ))}
                  <Button block type="dashed" icon={<AiOutlinePlus />} onClick={() => add({ isActive: true })}>
                    Add Option
                  </Button>
                </div>
              )}
            </Form.List>
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

export default VariantsForm;