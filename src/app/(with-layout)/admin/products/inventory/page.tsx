"use client";

import BaseSearch from "@base/components/BaseSearch";
import PageHeader from "@base/components/PageHeader";
import { Paths } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import WithAuthorization from "@modules/auth/components/WithAuthorization";
import InventoryList from "@modules/products/components/InventoryList";
import { ProductsHooks } from "@modules/products/lib/hooks";
import { IProductsFilter } from "@modules/products/lib/interfaces";
import { Tag } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

const InventoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    page = 1,
    limit = 20,
    ...rest
  } = Toolbox.parseQueryParams<IProductsFilter>(`?${searchParams.toString()}`);
  const inventoryQuery = ProductsHooks.useInventory({
    options: { ...rest, page, limit },
  });

  return (
    <React.Fragment>
      <PageHeader
        title="Inventory"
        subTitle={<BaseSearch />}
        tags={[
          <Tag key="total">
            Products in stock: {inventoryQuery.data?.meta?.total || 0}
          </Tag>,
        ]}
      />
      <InventoryList
        isLoading={inventoryQuery.isLoading}
        data={inventoryQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: inventoryQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (nextPage, nextLimit) => {
            const params = Toolbox.toCleanObject({
              ...Object.fromEntries(searchParams.entries()),
              page: nextPage,
              limit: nextLimit,
            });
            router.push(
              `${Paths.admin.products.inventory}?${new URLSearchParams(params).toString()}`,
            );
          },
        }}
      />
    </React.Fragment>
  );
};

export default WithAuthorization(InventoryPage, {
  allowedAccess: ["products:read"],
});
