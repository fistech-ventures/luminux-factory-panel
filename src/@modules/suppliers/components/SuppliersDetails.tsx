import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { SuppliersHooks } from '../lib/hooks';

interface IProps {
  id: TId;
}

const SuppliersDetails: React.FC<IProps> = ({ id }) => {
  const query = SuppliersHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const supplier = query.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'companyName', label: 'Company', children: supplier?.companyName || 'N/A' },
          { key: 'contactPerson', label: 'Contact Person', children: supplier?.contactPerson || 'N/A' },
          { key: 'contactNumber', label: 'Contact Number', children: supplier?.contactNumber || 'N/A' },
          { key: 'email', label: 'Email', children: supplier?.email || 'N/A' },
          { key: 'address', label: 'Address', span: 2, children: supplier?.address || 'N/A' },
          { key: 'createdBy', label: 'Created By', children: supplier?.createdBy?.fullName || 'N/A' },
          {
            key: 'createdAt',
            label: 'Created At',
            children: supplier?.createdAt ? dayjs(supplier.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A',
          },
        ]}
      />
    </DetailsBody>
  );
};

export default SuppliersDetails;
