'use client';

import BrandLogo from '@base/components/BrandLogo';
import { Paths } from '@lib/constant';
import { useAuthSession } from '@modules/auth/lib/utils/client';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();
  const { isLoading, isAuthenticate } = useAuthSession();

  return (
    <section>
      <div className="container">
        <div className="flex flex-col justify-center items-center min-h-screen gap-3">
          <BrandLogo />
          {isLoading || (
            <div className="flex gap-3">
              {isAuthenticate ? (
                <Button type="primary" onClick={() => router.push(Paths.admin.root)}>
                  Go to Panel
                </Button>
              ) : (
                <Button type="primary" onClick={() => router.push(Paths.auth.signIn)}>
                  Sign In
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomePage;