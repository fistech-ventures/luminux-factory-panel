'use client';

import WithAuthorization from '@modules/auth/components/WithAuthorization';
import SettingsIdentityForm from '@modules/settings/components/SettingsIdentityForm';
import { SettingsHooks } from '@modules/settings/lib/hooks';
import { Form, message, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

const SettingsPage = () => {
  const router = useRouter();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();

  const settingsQuery = SettingsHooks.useFind();

  const settingsUpdateFn = SettingsHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        messageApi.success(res.message);
        router.refresh();
      },
    },
  });

  return (
    <React.Fragment>
      {messageHolder}
      {settingsQuery.isLoading ? (
        <Spin />
      ) : (
        <SettingsIdentityForm
          formType="update"
          form={formInstance}
          isLoading={settingsUpdateFn.isPending}
          initialValues={settingsQuery.data?.data}
          onFinish={(values) => settingsUpdateFn.mutate(values)}
        />
      )}
    </React.Fragment>
  );
};

export default WithAuthorization(SettingsPage, { allowedAccess: ['settings:read'] });