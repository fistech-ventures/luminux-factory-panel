import FloatInput from '@base/antd/components/FloatInput';
import FloatInputPassword from '@base/antd/components/FloatInputPassword';
import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import CustomUploader from '@base/components/CustomUploader';
import InputPhone from '@base/components/InputPhone';
import { Toolbox } from '@lib/utils';
import { hasAccessPermission } from '@modules/auth/lib/utils/client';
import { RolesHooks } from '@modules/roles/lib/hooks';
import { IRole } from '@modules/roles/lib/interfaces';
import { Button, Col, Divider, Form, FormInstance, Radio, Row, Select, Tag, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { UsersHooks } from '../lib/hooks';

interface IProps {
  isLoading: boolean;
  /** User id — required to fetch available roles on update */
  userId?: string;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: any;
  onFinish: (values: any) => void;
  backendError?: string | null;
}

const UsersForm: React.FC<IProps> = ({ isLoading, userId, form, formType = 'create', initialValues, onFinish, backendError }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [rolesSearchTerm, setRolesSearchTerm] = useState(null);

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

  const canManageRoles = hasAccessPermission(['role-manager-roles:read']);

  /** All roles from GET /roles (paged + searchable) — used for the create form */
  const rolesQuery = RolesHooks.useFindInfinite({
    options: {
      page: 1,
      limit: 10,
      searchTerm: rolesSearchTerm,
    },
    config: {
      queryKey: [],
      enabled: canManageRoles,
    },
  });

  /** Roles not yet assigned to the user — used for the update form */
  const availableRolesQuery = UsersHooks.useFindAvailableRoles({
    id: userId,
    options: {
      page: 1,
      limit: 300,
    },
    config: {
      queryKey: [],
      enabled: formType === 'update' && !!userId && canManageRoles,
    },
  });

  /** Backend may return userRoles as [{ roleId }] (flat) or [{ role: { id, title } }] (nested). Extract ids either way. */
  const normalizeUserRoles = (userRoles: { role?: any; roleId?: any }[]): { id: string; title: string }[] =>
    (userRoles ?? []).map((userRole) => ({
      id: userRole?.role?.id ?? userRole?.roleId,
      title: userRole?.role?.title ?? userRole?.roleId,
    }));

  const currentRoleIds = normalizeUserRoles(initialValues?.userRoles ?? [])
    .map((r) => r.id)
    .filter(Boolean);

  const availableRoleOptions = Toolbox.toCleanArray(
    (availableRolesQuery.data?.data ?? []).map((role) => ({
      key: role?.id,
      label: role?.title,
      value: role?.id,
    })),
  );

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
          roles: currentRoleIds,
        }}
        onFinish={(values) => onFinish({ ...values, roles: values?.roles ?? [] })}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: '${label} is required!',
        }}
      >
        <Row gutter={[16, 16]}>
          {formType === 'create' && (
            <Col xs={24}>
              <Form.Item
                name="email"
                rules={[
                  { type: 'email', message: 'Email is not valid!' },
                  { required: true, message: 'Email is required!' },
                ]}
                className="!mb-0"
              >
                <FloatInput placeholder="Email" />
              </Form.Item>
            </Col>
          )}
          <Col xs={24}>
            <Form.Item name="fullName" rules={[{ required: true, message: 'Full name is required!' }]} className="!mb-0">
              <FloatInput placeholder="Full Name" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="gender" className="!mb-0">
              <Select
                allowClear
                placeholder="Gender"
                options={[
                  { key: 'male', label: 'Male', value: 'male' },
                  { key: 'female', label: 'Female', value: 'female' },
                  { key: 'other', label: 'Other', value: 'other' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="phoneNumber" className="!mb-0">
              <InputPhone placeholder="Phone Number" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="password"
              rules={[
                {
                  required: formType === 'create',
                  message: 'Password is required!',
                },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters long!',
                },
              ]}
              className="!mb-0"
            >
              <FloatInputPassword placeholder={formType === 'create' ? 'Password' : 'New Password (optional)'} />
            </Form.Item>
          </Col>
          {formType === 'create' && canManageRoles && (
            <Col xs={24}>
              <Form.Item
                name="roles"
                rules={[{ required: true, message: 'At least one role is required!' }]}
                className="!mb-0"
              >
                <InfiniteScrollSelect<IRole>
                  mode="multiple"
                  showSearch
                  allowClear
                  virtual={false}
                  placeholder="Roles"
                  option={({ item: role }) => ({
                    key: role?.id,
                    label: role?.title,
                    value: role?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setRolesSearchTerm(searchTerm)}
                  query={rolesQuery}
                />
              </Form.Item>
            </Col>
          )}
          {formType === 'update' && (
            <Col xs={24}>
              <Form.Item name="avatar" className="!mb-0">
                <CustomUploader
                  maxCount={1}
                  listType="picture-card"
                  acceptedTypes={['jpg', 'jpeg', 'png', 'webp', 'avif']}
                  initialValues={Toolbox.isNotEmpty(initialValues?.avatar) ? [initialValues.avatar] : []}
                  onChange={(urls) => form.setFieldValue('avatar', urls?.[0])}
                />
              </Form.Item>
            </Col>
          )}
          {formType === 'update' && (
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
          )}
          {formType === 'update' && canManageRoles && (
            <Col xs={24}>
              <Divider orientation="left" plain>
                Roles
              </Divider>
              <div className="flex flex-wrap gap-1 mb-2">
                {currentRoleIds?.length ? (
                  currentRoleIds.map((roleId) => {
                    const role = (initialValues?.userRoles ?? []).find((userRole) => userRole?.role?.id === roleId)?.role;
                    return <Tag key={roleId}>{role?.title || roleId}</Tag>;
                  })
                ) : (
                  <Tag>No roles assigned</Tag>
                )}
              </div>
              <Form.Item name="roles" className="!mb-0" extra="Pick roles to assign (roles not yet assigned to this user).">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Assign roles"
                  options={availableRoleOptions}
                  loading={availableRolesQuery.isLoading}
                />
              </Form.Item>
            </Col>
          )}
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

export default UsersForm;