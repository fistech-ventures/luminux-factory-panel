import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions, Statistic } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { EmployeesHooks } from '../lib/hooks';

interface IProps {
  id: TId;
}

const EmployeesDetails: React.FC<IProps> = ({ id }) => {
  const query = EmployeesHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const balanceQuery = EmployeesHooks.useBalance({ id, config: { queryKey: [], enabled: !!id } });
  const employee = query.data?.data;
  const balance = balanceQuery.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 p-3">
          <Statistic title="Total Advance" value={balance?.totalAdvance ?? 0} precision={2} />
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <Statistic title="Total Expense" value={balance?.totalExpense ?? 0} precision={2} />
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <Statistic
            title="Cash In Hand"
            value={balance?.balance ?? 0}
            precision={2}
            valueStyle={{ color: (balance?.balance ?? 0) < 0 ? '#cf1322' : '#3f8600' }}
          />
        </div>
      </div>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'employeeId', label: 'Employee ID', children: employee?.employeeId || 'N/A' },
          { key: 'name', label: 'Name', children: employee?.name || 'N/A' },
          { key: 'phoneNumber', label: 'Phone Number', children: employee?.phoneNumber || 'N/A' },
          { key: 'email', label: 'Email', children: employee?.email || 'N/A' },
          { key: 'designation', label: 'Designation', span: 2, children: employee?.designation || 'N/A' },
          { key: 'createdBy', label: 'Created By', children: employee?.createdBy?.fullName || 'N/A' },
          {
            key: 'createdAt',
            label: 'Created At',
            children: employee?.createdAt ? dayjs(employee.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A',
          },
        ]}
      />
    </DetailsBody>
  );
};

export default EmployeesDetails;
