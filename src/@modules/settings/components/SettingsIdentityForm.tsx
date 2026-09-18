import FloatInput from "@base/antd/components/FloatInput";
import FloatInputNumber from "@base/antd/components/FloatInputNumber";
import FloatSelect from "@base/antd/components/FloatSelect";
import FloatTextarea from "@base/antd/components/FloatTextarea";
import CountryCurrencySelect from "@base/components/CountryCurrencySelect";
import InputPhone from "@base/components/InputPhone";
import PhoneCodeSelect from "@base/components/PhoneCodeSelect";
import {
  Button,
  Col,
  ColorPicker,
  Form,
  FormInstance,
  Row,
  Select,
} from "antd";
import React from "react";
import { ISettings } from "../lib/interfaces";

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: Partial<ISettings>;
  onFinish: (values: ISettings) => void;
}

const SettingsIdentityForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = "create",
  initialValues,
  onFinish,
}) => {
  const formValues = Form.useWatch([], form);

  return (
    <Form
      autoComplete="off"
      size="large"
      layout="vertical"
      form={form}
      initialValues={initialValues}
      onFinish={onFinish}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Name is required!",
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="Name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="initialName"
            rules={[
              {
                required: true,
                message: "Initial name is required!",
              },
              {
                pattern: /^[a-z0-9]+$/,
                message: "Only lowercase characters and numbers are allowed!",
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="Initial Name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="icon"
            rules={[
              {
                type: "url",
                message: "Icon url must be a valid!",
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="Icon URL" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={16}>
          <Form.Item
            name="logo"
            rules={[
              {
                type: "url",
                message: "Logo url must be a valid!",
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="Logo URL" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="themePrimaryColor"
            rules={[
              {
                required: true,
                message: "Theme primary color is required!",
              },
            ]}
            className="!mb-0"
          >
            <ColorPicker
              allowClear
              showText
              onChange={(color) =>
                form.setFieldValue("themePrimaryColor", color.toHexString())
              }
              className="w-full !justify-start"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="themeSecondayColor"
            rules={[
              {
                required: true,
                message: "Theme secondary color is required!",
              },
            ]}
            className="!mb-0"
          >
            <ColorPicker
              allowClear
              showText
              onChange={(color) =>
                form.setFieldValue("themeSecondayColor", color.toHexString())
              }
              className="w-full !justify-start"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="phoneCode"
            rules={[
              {
                required: true,
                message: "Phone code is required!",
              },
            ]}
            className="!mb-0"
          >
            <PhoneCodeSelect
              isFloat
              showSearch
              code={formValues?.phoneCode}
              onSelectCode={(code) => form.setFieldValue("phoneCode", code)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="currency"
            rules={[
              {
                required: true,
                message: "Currency is required!",
              },
            ]}
            className="!mb-0"
          >
            <CountryCurrencySelect
              isFloat
              showSearch
              currency={formValues?.currency}
              onSelectCurrency={(currency) =>
                form.setFieldValue("currency", currency)
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} xl={16}>
          <Form.Item name="description" className="!mb-0">
            <FloatTextarea
              placeholder="Description"
              autoSize={{ minRows: 1, maxRows: 3 }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item name="phone" className="!mb-0">
            <InputPhone size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} xl={8}>
          <Form.Item name="address" className="!mb-0">
            <FloatInput placeholder="Address" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name={["socialUrls", "facebook"]}
            rules={[
              {
                type: "url",
                message: "Facebook url must be a valid!",
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="Facebook URL" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name={["socialUrls", "instagram"]}
            rules={[
              {
                type: "url",
                message: "Instagram url must be a valid!",
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="Instagram URL" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name={["socialUrls", "youtube"]}
            rules={[
              {
                type: "url",
                message: "YouTube url must be a valid!",
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="YouTube URL" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="allowUserRegistration"
            rules={[
              {
                required: true,
                message: "User registration allowance is required!",
              },
            ]}
            className="!mb-0"
          >
            <FloatSelect
              showSearch
              virtual={false}
              placeholder="User Acceptance"
              filterOption={(input, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Select.Option value={true}>Accepted</Select.Option>
              <Select.Option value={false}>Not Accepted</Select.Option>
            </FloatSelect>
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="userRegistrationVerificationRequired"
            rules={[
              {
                required: true,
                message: "User verification requirement is required!",
              },
            ]}
            className="!mb-0"
          >
            <FloatSelect
              showSearch
              virtual={false}
              placeholder="User Verification"
              filterOption={(input, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Select.Option value={true}>Need</Select.Option>
              <Select.Option value={false}>No Need</Select.Option>
            </FloatSelect>
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="needWebView"
            rules={[
              {
                required: true,
                message: "Web view requirement is required!",
              },
            ]}
            className="!mb-0"
          >
            <FloatSelect
              showSearch
              virtual={false}
              placeholder="Web View"
              filterOption={(input, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Select.Option value={true}>Need</Select.Option>
              <Select.Option value={false}>No Need</Select.Option>
            </FloatSelect>
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item
            name="otpExpiresInMin"
            rules={[
              {
                required: true,
                message: "OTP expiration time is required!",
              },
            ]}
            className="!mb-0"
          >
            <FloatInputNumber
              placeholder="OTP Expires in Minutes"
              className="!w-full"
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item className="text-right !mb-0">
            <Button loading={isLoading} type="primary" htmlType="submit">
              {formType === "create" ? "Create" : "Update"}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SettingsIdentityForm;
