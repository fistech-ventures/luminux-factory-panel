'use client';

import BrandLogo from '@base/components/BrandLogo';
import CustomLink from '@base/components/CustomLink';
import { Paths } from '@lib/constant';
import UsersForm from '@modules/users/components/UsersForm';
import { Form, message } from 'antd';
import { useRouter } from 'next/navigation';
import { AuthHooks } from '../lib/hooks';

interface IProps {
  hash: string;
}

const SignUpSection = ({ hash }: IProps) => {
  const router = useRouter();
  const [formInstance] = Form.useForm();
  const [messageApi, messageHolder] = message.useMessage();

  const signUpFn = AuthHooks.useSignUpWithLink({
    config: {
      onSuccess(data) {
        if (!data.success) {
          messageApi.error(data.message);
          return;
        }

        messageApi.loading(data.message, 1).then(() => router.push(Paths.admin.root));
      },
    },
  });

  return (
    <section>
      {messageHolder}
      <div className="container">
        <div className="flex min-h-screen items-center justify-center py-8">
          <div className="grid w-full max-w-[680px] grid-cols-1 items-center gap-8 rounded-2xl bg-white p-4 md:p-8">
            <div className="text-center">
              <CustomLink href={Paths.root}>
                <BrandLogo />
              </CustomLink>
              <h3 className="text-xl font-medium md:text-2xl">Visa Processing Support Center in Bangladesh</h3>
            </div>
            <UsersForm
              form={formInstance}
              initialValues={{ isActive: true }}
              isLoading={signUpFn.isPending}
              onFinish={(values) => signUpFn.mutate({ ...values, hash })}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUpSection;
