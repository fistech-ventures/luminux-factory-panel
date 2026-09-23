export type TPermission = (typeof Permissions)[keyof typeof Permissions];

export const Permissions = {
  FORBIDDEN: 'FORBIDDEN',

  DASHBOARD_READ: 'dashboard:read',

  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  ROLE_MANAGER_PERMISSION_TYPES_READ: 'role-manager-permission-types:read',
  ROLE_MANAGER_PERMISSION_TYPES_WRITE: 'role-manager-permission-types:write',
  ROLE_MANAGER_PERMISSION_TYPES_UPDATE: 'role-manager-permission-types:update',
  ROLE_MANAGER_PERMISSION_TYPES_DELETE: 'role-manager-permission-types:delete',

  ROLE_MANAGER_PERMISSIONS_READ: 'role-manager-permissions:read',
  ROLE_MANAGER_PERMISSIONS_WRITE: 'role-manager-permissions:write',
  ROLE_MANAGER_PERMISSIONS_UPDATE: 'role-manager-permissions:update',
  ROLE_MANAGER_PERMISSIONS_DELETE: 'role-manager-permissions:delete',

  ROLE_MANAGER_ROLES_READ: 'role-manager-roles:read',
  ROLE_MANAGER_ROLES_WRITE: 'role-manager-roles:write',
  ROLE_MANAGER_ROLES_UPDATE: 'role-manager-roles:update',
  ROLE_MANAGER_ROLES_DELETE: 'role-manager-roles:delete',

  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',

  VARIANTS_READ: 'variants:read',
  VARIANTS_WRITE: 'variants:write',
  VARIANTS_UPDATE: 'variants:update',

  PRODUCT_VARIANT_OPTIONS_READ: 'product-variant-options:read',
  PRODUCT_VARIANT_OPTIONS_WRITE: 'product-variant-options:write',
  PRODUCT_VARIANT_OPTIONS_UPDATE: 'product-variant-options:update',
  PRODUCT_VARIANT_OPTIONS_DELETE: 'product-variant-options:delete',

  PURCHASES_READ: 'purchases:read',
  PURCHASES_WRITE: 'purchases:write',
  PURCHASES_UPDATE: 'purchases:update',
  PURCHASES_DELETE: 'purchases:delete',

  SALES_READ: 'sales:read',
  SALES_WRITE: 'sales:write',
  SALES_UPDATE: 'sales:update',
  SALES_DELETE: 'sales:delete',

  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',

  SUPPLIERS_READ: 'suppliers:read',
  SUPPLIERS_WRITE: 'suppliers:write',
  SUPPLIERS_UPDATE: 'suppliers:update',
  SUPPLIERS_DELETE: 'suppliers:delete',

  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
  EMPLOYEES_UPDATE: 'employees:update',
  EMPLOYEES_DELETE: 'employees:delete',

  INVESTMENTS_READ: 'investments:read',
  INVESTMENTS_WRITE: 'investments:write',
  INVESTMENTS_UPDATE: 'investments:update',
  INVESTMENTS_DELETE: 'investments:delete',

  EXPENSES_READ: 'expenses:read',
  EXPENSES_WRITE: 'expenses:write',
  EXPENSES_UPDATE: 'expenses:update',
  EXPENSES_DELETE: 'expenses:delete',

  LEDGER_READ: 'ledger:read',
  LEDGER_WRITE: 'ledger:write',
  LEDGER_UPDATE: 'ledger:update',
  LEDGER_DELETE: 'ledger:delete',

  PAYMENTS_READ: 'payments:read',
  PAYMENTS_WRITE: 'payments:write',
  PAYMENTS_UPDATE: 'payments:update',
  PAYMENTS_DELETE: 'payments:delete',

  GALLERY_READ: 'gallery:read',
  GALLERY_WRITE: 'gallery:write',
  GALLERY_UPDATE: 'gallery:update',
  GALLERY_DELETE: 'gallery:delete',

  SETTINGS_READ: 'settings:read',
} as const;