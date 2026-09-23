import DetailsBody from '@base/components/DetailsBody';
import { TId } from '@base/interfaces';
import { Descriptions } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { InvestmentsHooks } from '../lib/hooks';

const InvestmentsDetails: React.FC<{ id: TId }> = ({ id }) => {
  const query = InvestmentsHooks.useFindById({ id, config: { queryKey: [], enabled: !!id } });
  const investment = query.data?.data;

  return (
    <DetailsBody isLoading={query.isLoading} error={query.error}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'date', label: 'Date', children: investment?.date ? dayjs(investment.date).format('YYYY-MM-DD') : 'N/A' },
          { key: 'title', label: 'Title', children: investment?.title || 'N/A' },
          { key: 'investor', label: 'Investor', children: investment?.investor?.name || 'N/A' },
          { key: 'amount', label: 'Amount', children: investment?.amount != null ? Number(investment.amount).toFixed(2) : 'N/A' },
        ]}
      />
    </DetailsBody>
  );
};

export default InvestmentsDetails;
