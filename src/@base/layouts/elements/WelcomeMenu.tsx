import BaseModalWithoutClicker from '@base/components/BaseModalWithoutClicker';
import ThemeToggler from '@base/components/ThemeToggler';
import { cn } from '@lib/utils';
import { AuthHooks } from '@modules/auth/lib/hooks';
import { useAuthSession } from '@modules/auth/lib/utils/client';
import ProfileCard from '@modules/ProfileCard';
import { SettingsHooks } from '@modules/settings/lib/hooks';
import { Button, Dropdown } from 'antd';
import React, { useState } from 'react';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa';

const signOutFn = AuthHooks.useSignOut;

interface IProps {
  className?: string;
}

const WelcomeMenu: React.FC<IProps> = ({ className }) => {
  const { user } = useAuthSession();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const settingsQuery = SettingsHooks.useFindQuick();

  const items = [
    {
      key: 'Profile',
      icon: <AiOutlineUser />,
      label: 'Profile',
      onClick: () => setProfileModalOpen(true),
      disabled: false,
    },
    {
      key: 'Signout',
      icon: <AiOutlineLogout />,
      label: 'Sign out',
      onClick: signOutFn,
      disabled: false,
    },
  ];

  return (
    <React.Fragment>
      <Dropdown
        className={className}
        popupRender={() => {
          return (
            <div className="bg-white dark:bg-[var(--color-rich-black)] p-4 border border-[var(--color-gray-100)] rounded-lg shadow-sm">
              <p className="font-medium text-xs text-[var(--color-gray-500)]">
                Welcome to {settingsQuery.data?.data?.name}!
              </p>
              <p className="font-semibold">{user?.fullName}</p>
              <ul className="flex flex-col gap-2 border-t border-t-[var(--color-gray-100)] pt-4 mt-4">
                {items.map((item) => (
                  <li
                    key={item.key}
                    className={cn(
                      'flex items-center gap-2 select-none hover:text-[var(--color-primary-500)] transition-colors duration-500 cursor-pointer',
                      { 'opacity-50 cursor-not-allowed': item.disabled },
                    )}
                    onClick={item.onClick}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center border-t border-t-[var(--color-gray-100)] pt-4 mt-4">
                <ThemeToggler />
              </div>
            </div>
          );
        }}
      >
        <Button className="!rounded-full">
          <FaUser />
        </Button>
      </Dropdown>
      <BaseModalWithoutClicker
        destroyOnHidden
        footer={null}
        width={580}
        open={isProfileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
        classNames={{ content: '!bg-transparent !shadow-none' }}
      >
        <ProfileCard user={user} />
      </BaseModalWithoutClicker>
    </React.Fragment>
  );
};

export default WelcomeMenu;
