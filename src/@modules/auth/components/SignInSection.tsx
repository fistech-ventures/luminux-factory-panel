'use client';

import BaseModalWithoutClicker from '@base/components/BaseModalWithoutClicker';
import BrandLogo from '@base/components/BrandLogo';
import CustomLink from '@base/components/CustomLink';
import OtpVerificationForm from '@base/components/OtpVerificationForm';
import ThemeToggler from '@base/components/ThemeToggler';
import { Messages, Paths } from '@lib/constant';
import { Storage } from '@lib/utils';
import { SettingsHooks } from '@modules/settings/lib/hooks';
import { Button, Flex, Form, Input, message } from 'antd';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { IDENTIFIER_KEY, OTP_HASH_KEY, REDIRECT_PREFIX } from '../lib/constant';
import { AuthHooks } from '../lib/hooks';
import { setAuthSession } from '../lib/utils/client';

const SignInSection = () => {
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const redirectUrl = searchParams.get(REDIRECT_PREFIX)?.toString();
  const url = redirectUrl || Paths.admin.root;
  const [isPRRModalOpen, setPRRModalOpen] = useState(false);
  const [isPRModalOpen, setPRModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState(null);

  const settingsQuery = SettingsHooks.useFindQuick();

  const signInFn = AuthHooks.useSignIn({
    config: {
      onSuccess(data) {
        if (!data.success) {
          messageApi.error(data.message);
          return;
        }

        setAuthSession(data.data);

        messageApi.loading(Messages.signIn(settingsQuery.data?.data?.name), 1).then(() => {
          window.location.replace(url);
        });
      },
    },
  });

  const passwordResetRequestFn = AuthHooks.usePasswordResetRequest({
    config: {
      onSuccess(data) {
        if (!data.success) {
          messageApi.error(data.message);
          return;
        }

        setPRRModalOpen(false);
        Storage.setData(OTP_HASH_KEY, data.data?.hash);
        Storage.setData(IDENTIFIER_KEY, data.data?.identifier);
        messageApi.loading(data.message, 1).then(() => setPRModalOpen(true));
      },
    },
  });

  const passwordResetFn = AuthHooks.usePasswordReset({
    config: {
      onSuccess(data) {
        if (!data.success) {
          messageApi.error(data.message);
          return;
        }

        Storage.removeData(OTP_HASH_KEY);
        Storage.removeData(IDENTIFIER_KEY);
        setNewPassword(null);
        messageApi.loading(data.message, 1).then(() => setPRModalOpen(false));
      },
    },
  });

  return (
    <section>
      {messageHolder}
      <div className="container">
        <div className="flex justify-center items-center min-h-screen pb-8 pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center w-full max-w-[850px] bg-white dark:bg-black/20 p-4 rounded-2xl md:p-8">
            <div className="hidden md:block text-center">
              <Image src="/images/auth.svg" alt="Sign In Illustration" width={300} height={300} />
            </div>
            <div className="!space-y-2">
              <div className="flex flex-col items-center md:items-start gap-2 mb-4">
                <ThemeToggler className="absolute top-4 right-4" />
                <CustomLink href={Paths.root}>
                  <BrandLogo className="max-w-48" />
                </CustomLink>
                <h3 className="text-xl font-medium md:text-2xl dark:text-white">Sign in to your account</h3>
              </div>
              <Form size="large" onFinish={signInFn.mutate}>
                <Form.Item
                  name="identifier"
                  rules={[
                    {
                      type: 'email',
                      message: 'Please enter a valid email address!',
                    },
                    {
                      required: true,
                      message: 'Email is required!',
                    },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Password is required!',
                    },
                    // {
                    //   min: 8,
                    //   message: 'Password must be at least 8 characters long!',
                    // },
                  ]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item className="!mb-0">
                  <Button type="primary" htmlType="submit" loading={signInFn.isPending} className="w-full">
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
              <Flex justify="center">
                <Button type="text" onClick={() => setPRRModalOpen(true)}>
                  Forgot password?
                </Button>
              </Flex>
            </div>
          </div>
        </div>
      </div>
      <BaseModalWithoutClicker
        destroyOnHidden
        title="Recover Password"
        width={450}
        open={isPRRModalOpen}
        onCancel={() => setPRRModalOpen(false)}
        footer={null}
      >
        <Form
          size="large"
          onFinish={(values) => {
            setNewPassword(values.password);
            passwordResetRequestFn.mutate({ identifier: values.identifier });
          }}
        >
          <Form.Item
            name="identifier"
            rules={[
              {
                type: 'email',
                message: 'Please enter a valid email address!',
              },
              {
                required: true,
                message: 'Email is required!',
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Password is required!',
              },
              {
                min: 8,
                message: 'Password must be at least 8 characters long!',
              },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item className="!mb-0">
            <Button type="primary" htmlType="submit" loading={passwordResetRequestFn.isPending} className="w-full">
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </BaseModalWithoutClicker>
      <BaseModalWithoutClicker
        destroyOnHidden
        width={540}
        open={isPRModalOpen}
        onCancel={() => {
          Storage.removeData(OTP_HASH_KEY);
          Storage.removeData(IDENTIFIER_KEY);
          setPRModalOpen(false);
          setNewPassword(null);
        }}
        footer={null}
      >
        <OtpVerificationForm
          staticTimer={{ minute: 5, second: 0 }}
          onRetry={() => passwordResetRequestFn.mutate({ identifier: Storage.getData(IDENTIFIER_KEY) })}
          onFinish={(otp) => {
            passwordResetFn.mutate({
              identifier: Storage.getData(IDENTIFIER_KEY),
              hash: Storage.getData(OTP_HASH_KEY),
              otp: +otp,
              newPassword,
            });
          }}
        />
      </BaseModalWithoutClicker>
    </section>
  );
};

export default SignInSection;
