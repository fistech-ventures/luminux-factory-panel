import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { EmployeesHooks } from '@modules/employees/lib/hooks';
import { ExpensesHooks } from '../lib/hooks';

interface IProps {
  id: TId;
}

const ExpensesDetails: React.FC<IProps> = ({ id }) => {
  const query = ExpensesHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const expense = query.data?.data;
  const employeeQuery = EmployeesHooks.useFindById({
    id: expense?.employeeId,
    config: { queryKey: [], enabled: !!expense?.employeeId },
  });
  const employee = employeeQuery.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'date', label: 'Date', children: expense?.date ? dayjs(expense.date).format('DD/MM/YYYY') : 'N/A' },
          { key: 'purpose', label: 'Purpose', children: expense?.purpose || 'N/A' },
          { key: 'amountSpent', label: 'Amount Spent', children: Number(expense?.amountSpent || 0).toFixed(2) },
          { key: 'paymentMethod', label: 'Payment Method', children: expense?.paymentMethod || 'N/A' },
          { key: 'spentBy', label: 'Spent By', children: expense?.spentBy || 'N/A' },
          {
            key: 'employee',
            label: 'Employee',
            children: employee
              ? `${employee.name} (${employee.employeeId})`
              : expense?.employeeId || 'N/A',
          },
          { key: 'createdBy', label: 'Created By', children: expense?.createdBy?.fullName || 'N/A' },
          {
            key: 'createdAt',
            label: 'Created At',
            children: expense?.createdAt ? dayjs(expense.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A',
          },
          {
            key: 'updatedAt',
            label: 'Updated At',
            children: expense?.updatedAt ? dayjs(expense.updatedAt).format('DD/MM/YYYY HH:mm') : 'N/A',
          },
        ]}
      />
    </DetailsBody>
  );
};

export default ExpensesDetails;
