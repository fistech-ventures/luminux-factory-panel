import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { CustomersHooks } from '../lib/hooks';

interface IProps {
  id: TId;
}

const CustomersDetails: React.FC<IProps> = ({ id }) => {
  const query = CustomersHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const customer = query.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          {
            key: 'customerType',
            label: 'Type',
            children: customer?.customerType ? (
              <Tag color={customer.customerType === 'B2B' ? 'blue' : 'green'}>{customer.customerType}</Tag>
            ) : (
              'N/A'
            ),
          },
          { key: 'name', label: 'Name', children: customer?.name || 'N/A' },
          { key: 'contactNumber', label: 'Contact Number', children: customer?.contactNumber || 'N/A' },
          { key: 'email', label: 'Email', children: customer?.email || 'N/A' },
          { key: 'companyName', label: 'Company', children: customer?.companyName || 'N/A' },
          { key: 'address', label: 'Address', span: 2, children: customer?.address || 'N/A' },
          { key: 'createdBy', label: 'Created By', children: customer?.createdBy?.fullName || 'N/A' },
          {
            key: 'createdAt',
            label: 'Created At',
            children: customer?.createdAt ? dayjs(customer.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A',
          },
        ]}
      />
    </DetailsBody>
  );
};

export default CustomersDetails;
