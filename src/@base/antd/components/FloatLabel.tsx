import { cn } from '@lib/utils';
import { theme } from 'antd';
import { InputStatus } from 'antd/es/_util/statusUtils';
import React, { useMemo } from 'react';

export interface IProps {
  focused?: boolean;
  hovered?: boolean;
  hasValue?: boolean;
  label?: React.ReactNode;
  children?: React.ReactNode;
  width?: string | number;
  height?: string | number;
  status?: InputStatus;
  required?: boolean;
}

const FloatLabel: React.FC<IProps> = ({
  focused,
  hovered,
  hasValue,
  label,
  children,
  width,
  height,
  status,
  required,
}) => {
  const { token } = theme.useToken();

  const statusColor = useMemo(() => {
    const colors = {
      text: token.colorTextTertiary,
      textActive: token.colorPrimary,
      border: focused || hovered ? token.colorPrimary : token.colorBorder,
      boxShadow: token.controlOutline,
    };

    if (status === 'warning') {
      colors.text = token.colorWarningText;
      colors.textActive = token.colorWarningTextActive;
      colors.border = token.colorWarning;
      colors.boxShadow = token.colorWarningOutline;
    } else if (status === 'error') {
      colors.text = token.colorErrorText;
      colors.textActive = token.colorErrorTextActive;
      colors.border = token.colorError;
      colors.boxShadow = token.colorErrorOutline;
    }

    return colors;
  }, [focused, hovered, status, token]);

  return (
    <div
      className="relative"
      style={{
        width: width ?? '100%',
        height,
      }}
    >
      {children}
      <label
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-10 flex h-full origin-top-left items-center overflow-hidden text-ellipsis whitespace-nowrap transition-all ease-in-out text-base before:content-[''] before:absolute before:left-0 before:top-0 before:w-full before:h-full before:-z-10",
          { 'before:bg-[var(--bg-before)]': focused || hasValue },
        )}
        style={{
          color: focused ? statusColor.textActive : statusColor.text,
          height: focused || hasValue ? 'auto' : '100%',
          paddingInline: focused || hasValue ? 4 : 0,
          border: focused || hasValue ? `1px solid ${statusColor.border}` : 'none',
          borderRadius: focused || hasValue ? 4 : 0,
          boxShadow: focused ? `0 0 0 ${token.controlOutlineWidth}px ${statusColor.boxShadow}` : 'none',
          transform: focused || hasValue ? 'translate(11px, -10px) scale(0.75)' : `translate(1em, 0px) scale(1)`,
          ...({
            '--bg-before': token.colorBgContainer,
          } as React.CSSProperties),
        }}
      >
        {required ? (
          <div style={{ display: 'flex', gap: '0.2em', alignItems: 'center' }}>
            <span>{label}</span>
            <span>*</span>
          </div>
        ) : (
          label
        )}
      </label>
    </div>
  );
};

export default FloatLabel;
