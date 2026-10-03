import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Avatar, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { UsersHooks } from '../lib/hooks';

interface IProps {
  id: TId;
}

const UsersDetails: React.FC<IProps> = ({ id }) => {
  const query = UsersHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const user = query.data?.data;

  /** Backend may return userRoles as [{ roleId }] (flat) or [{ role: { id, title } }] (nested). */
  const roleTitles = (user?.userRoles ?? [])
    .map((userRole: any) => userRole?.role?.title ?? userRole?.roleId)
    .filter(Boolean);

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          {
            key: 'fullName',
            label: 'Name',
            span: 2,
            children: (
              <div className="flex items-center gap-2">
                <Avatar src={user?.avatar}>{user?.fullName?.charAt(0)?.toUpperCase()}</Avatar>
                <span>{user?.fullName || 'N/A'}</span>
              </div>
            ),
          },
          { key: 'email', label: 'Email', children: user?.email || 'N/A' },
          { key: 'phoneNumber', label: 'Phone', children: user?.phoneNumber || 'N/A' },
          { key: 'username', label: 'Username', children: user?.username || 'N/A' },
          { key: 'gender', label: 'Gender', children: user?.gender || 'N/A' },
          {
            key: 'roles',
            label: 'Roles',
            span: 2,
            children: roleTitles?.length ? (
              <div className="flex flex-wrap gap-1">
                {roleTitles.map((role: string) => (
                  <Tag key={role}>{role}</Tag>
                ))}
              </div>
            ) : (
              'N/A'
            ),
          },
          {
            key: 'isActive',
            label: 'Status',
            children: <Tag color={user?.isActive ? 'green' : 'red'}>{user?.isActive ? 'Active' : 'Inactive'}</Tag>,
          },
          {
            key: 'createdAt',
            label: 'Created At',
            children: user?.createdAt ? dayjs(user.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A',
          },
        ]}
      />
    </DetailsBody>
  );
};

export default UsersDetails;
