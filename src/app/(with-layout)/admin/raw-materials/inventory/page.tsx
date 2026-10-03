'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Paths } from '@lib/constant';
import { Toolbox } from '@lib/utils';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import RawMaterialsInventoryList from '@modules/raw-materials/components/RawMaterialsInventoryList';
import { RawMaterialsHooks } from '@modules/raw-materials/lib/hooks';
import { IRawMaterialsFilter } from '@modules/raw-materials/lib/interfaces';
import { Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

const RawMaterialsInventoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { page = 1, limit = 20, ...filters } = Toolbox.parseQueryParams<IRawMaterialsFilter>(
    `?${searchParams.toString()}`,
  );
  const inventoryQuery = RawMaterialsHooks.useInventory({
    options: { ...filters, page, limit },
  });

  return (
    <>
      <PageHeader
        title="Raw Material Inventory"
        subTitle={<BaseSearch />}
        tags={[<Tag key="total">Raw materials in stock: {inventoryQuery.data?.meta?.total ?? 0}</Tag>]}
      />
      <RawMaterialsInventoryList
        isLoading={inventoryQuery.isLoading}
        data={inventoryQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: inventoryQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (nextPage: number, nextLimit: number) => {
            const params = Toolbox.toCleanObject({
              ...Object.fromEntries(searchParams.entries()),
              page: nextPage,
              limit: nextLimit,
            });
            router.push(
              `${Paths.admin.rawMaterials.inventory}?${new URLSearchParams(params).toString()}`,
            );
          },
        }}
      />
    </>
  );
};

export default WithAuthorization(RawMaterialsInventoryPage, {
  allowedAccess: ['products:read'],
});