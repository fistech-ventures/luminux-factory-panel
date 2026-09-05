'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { DayjsConfig, queryClient } from '@lib/config';
import useTheme from '@lib/hooks/useTheme';
import { setNotificationInstance } from '@lib/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ThemeConfig } from 'antd';
import { ConfigProvider, notification, theme as themeConfig } from 'antd';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import dynamic from 'next/dynamic';
import NextNProgress from 'nextjs-progressbar';
import { useEffect, type PropsWithChildren } from 'react';

const PathGuard = dynamic(() => import('./PathGuard'), {
  ssr: false,
});

const DEFAULT_PRIMARY = '#2b3589';

type TProps = PropsWithChildren<{
  nextFont: (NextFontWithVariable & { originalVariableName: string })[];
  /** From `getCachedQuickSettingsFn` → `themePrimaryColor`; Ant Design derives hover/active when set alone. */
  brandPrimaryHex?: string | null;
}>;

export const Providers = ({ nextFont, brandPrimaryHex, children }: TProps) => {
  const { isLight } = useTheme();
  const [notificationApi, notificationHolder] = notification.useNotification();

  DayjsConfig();

  const primary = brandPrimaryHex?.trim() || DEFAULT_PRIMARY;
  const usePresetPrimaryTokens = !brandPrimaryHex?.trim();

  const theme: ThemeConfig = {
    algorithm: isLight ? themeConfig.defaultAlgorithm : themeConfig.darkAlgorithm,
    token: {
      fontFamily: nextFont.map((font) => `var(${font.originalVariableName})`).join(', '),
      fontSize: 16,
      colorPrimary: primary,
      ...(usePresetPrimaryTokens
        ? {
            colorPrimaryActive: '#202867',
            colorPrimaryBorder: '#2b3589',
            colorPrimaryHover: '#202867',
            colorLinkActive: '#202867',
            colorLinkHover: '#202867',
          }
        : {}),
      screenXSMax: 639,
      screenSMMin: 640,
      screenSM: 640,
      screenMDMax: 1023,
      screenLGMin: 1024,
      screenLG: 1024,
      screenLGMax: 1279,
      screenXLMin: 1280,
      screenXL: 1280,
      screenXLMax: 1535,
      screenXXLMin: 1536,
      screenXXL: 1536,
    },
  };

  useEffect(() => {
    setNotificationInstance(notificationApi);
  }, [notificationApi]);

  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <PathGuard>
            <NextNProgress color="var(--color-primary-500)" height={3} options={{ showSpinner: false }} />
            <main
              role="main"
              id="__main"
              className={[...nextFont.map((font) => font.variable), 'font-roboto'].join(' ')}
            >
              {notificationHolder} {children}
            </main>
          </PathGuard>
        </QueryClientProvider>
      </ConfigProvider>
    </AntdRegistry>
  );
};
