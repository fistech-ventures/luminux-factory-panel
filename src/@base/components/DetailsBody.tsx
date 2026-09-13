import { Alert, Spin } from 'antd';
import React from 'react';

interface IProps {
  isLoading?: boolean;
  error?: unknown;
  children: React.ReactNode;
}

/** Shared feedback wrapper for details popups: spinner while loading, error alert when the request fails. */
const DetailsBody: React.FC<IProps> = ({ isLoading, error, children }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        showIcon
        type="error"
        message="Failed to load details"
        description={error instanceof Error ? error.message : String(error)}
      />
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default DetailsBody;
