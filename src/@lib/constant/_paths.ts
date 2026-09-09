import { TId } from '@base/interfaces';

export const Paths = {
  root: '/',
  initiate: '/initiate',
  underConstruction: '/under-construction',
  auth: {
    signIn: '/auth',
    register: '/auth/register',
  },
  admin: {
    root: '/admin',
    users: {
      root: '/admin/users',
      list: '/admin/users/list',
    },
    roleManager: {
      root: '/admin/role-manager',
      permissionTypes: {
        root: '/admin/role-manager/permission-types',
        list: '/admin/role-manager/permission-types/list',
      },
      permissions: {
        root: '/admin/role-manager/permissions',
        list: '/admin/role-manager/permissions/list',
      },
      roles: {
        root: '/admin/role-manager/roles',
        list: '/admin/role-manager/roles/list',
        toId: (id: TId) => `/admin/role-manager/roles/${id}`,
      },
    },
    products: {
      root: '/admin/products',
      list: '/admin/products/list',
    },
    variants: {
      root: '/admin/variants',
      list: '/admin/variants/list',
    },
    productVariantOptions: {
      root: '/admin/product-variant-options',
      list: '/admin/product-variant-options/list',
    },
    purchases: {
      root: '/admin/purchases',
      list: '/admin/purchases/list',
    },
    sales: {
      root: '/admin/sales',
      list: '/admin/sales/list',
    },
    customers: {
      root: '/admin/customers',
      list: '/admin/customers/list',
    },
    suppliers: {
      root: '/admin/suppliers',
      list: '/admin/suppliers/list',
    },
    expenses: {
      root: '/admin/expenses',
      list: '/admin/expenses/list',
    },
    ledger: {
      root: '/admin/ledger',
      list: '/admin/ledger/list',
    },
    profit: {
      root: '/admin/profit',
      list: '/admin/profit/list',
    },
    loss: {
      root: '/admin/loss',
      list: '/admin/loss/list',
    },
    accounts: {
      root: '/admin/accounts',
      list: '/admin/accounts/list',
    },
    payments: {
      root: '/admin/payments',
      list: '/admin/payments/list',
    },
    gallery: {
      root: '/admin/gallery',
      list: '/admin/gallery/list',
    },
    settings: {
      root: '/admin/settings',
    },
  },
};