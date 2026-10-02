import CustomLink from "@base/components/CustomLink";
import { Paths, Permissions } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import { getContentAccess } from "@modules/auth/lib/utils/client";
import { Menu } from "antd";
import React from "react";
import {
  FaBook,
  FaChartBar,
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaUserTag,
} from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { GrUserAdmin } from "react-icons/gr";
import { RiUserStarFill } from "react-icons/ri";
import {
  MdAccountBalance,
  MdDashboard,
  MdOutlineAccountBalanceWallet,
  MdOutlineAttachMoney,
  MdOutlineCategory,
  MdOutlineHandshake,
  MdOutlineInventory2,
  MdOutlineLayers,
  MdOutlinePeopleOutline,
  MdOutlinePointOfSale,
  MdOutlineReceiptLong,
  MdOutlineSettings,
  MdOutlineShoppingCart,
  MdPayment,
} from "react-icons/md";

interface IProps {
  className?: string;
  selectedKeys: string[];
  openKeys: string[];
  onOpenChange: (openKeys: string[]) => void;
}

const link = (path: string, label: string, pagination = true) => (
  <CustomLink href={pagination ? Toolbox.appendPagination(path) : path}>
    {label}
  </CustomLink>
);

const AdminMenu: React.FC<IProps> = ({
  className,
  selectedKeys,
  openKeys,
  onOpenChange,
}) => {
  return (
    <Menu
      className={className}
      mode="inline"
      theme="light"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      items={[
        {
          key: Paths.admin.root,
          icon: <MdDashboard />,
          label: link(Paths.admin.root, "Dashboard", false),
        },
        getContentAccess({
          content: {
            key: "finance",
            icon: <MdAccountBalance />,
            label: "Accounts",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.accounts.list,
                  icon: <MdOutlineAccountBalanceWallet />,
                  label: link(Paths.admin.accounts.list, "Reports"),
                },
                allowedAccess: [
                  Permissions.SALES_READ,
                  Permissions.PURCHASES_READ,
                  Permissions.EXPENSES_READ,
                ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.payments.list,
                  icon: <MdPayment />,
                  label: link(Paths.admin.payments.list, "Transactions"),
                },
                allowedAccess: [Permissions.PAYMENTS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.expenses.list,
                  icon: <MdOutlineReceiptLong />,
                  label: link(Paths.admin.expenses.list, "Expenses"),
                },
                allowedAccess: [Permissions.EXPENSES_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.ledger.list,
                  icon: <FaBook />,
                  label: link(Paths.admin.ledger.list, "Ledger"),
                },
                allowedAccess: [Permissions.LEDGER_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.ledger.statement,
                  icon: <FiFileText />,
                  label: link(
                    Paths.admin.ledger.statement,
                    "Statements",
                    false,
                  ),
                },
                allowedAccess: [Permissions.LEDGER_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.investments.list,
                  icon: <MdOutlineAttachMoney />,
                  label: link(Paths.admin.investments.list, "Investments"),
                },
                allowedAccess: [Permissions.INVESTMENTS_READ],
              }),
            ],
          },
          allowedAccess: [
            Permissions.SALES_READ,
            Permissions.PURCHASES_READ,
            Permissions.EXPENSES_READ,
            Permissions.PAYMENTS_READ,
            Permissions.LEDGER_READ,
            Permissions.INVESTMENTS_READ,
          ],
        }),
        getContentAccess({
          content: {
            key: "people",
            icon: <MdOutlinePeopleOutline />,
            label: "People",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.employees.list,
                  icon: <FaUsers />,
                  label: link(Paths.admin.employees.list, "Employees"),
                },
                allowedAccess: [Permissions.EMPLOYEES_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.customers.list,
                  icon: <MdOutlinePeopleOutline />,
                  label: link(Paths.admin.customers.list, "Customers"),
                },
                allowedAccess: [Permissions.CUSTOMERS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.suppliers.list,
                  icon: <MdOutlineHandshake />,
                  label: link(Paths.admin.suppliers.list, "Suppliers"),
                },
                allowedAccess: [Permissions.SUPPLIERS_READ],
              }),
            ],
          },
          allowedAccess: [
            Permissions.EMPLOYEES_READ,
            Permissions.CUSTOMERS_READ,
            Permissions.SUPPLIERS_READ,
          ],
        }),
        getContentAccess({
          content: {
            key: "products",
            icon: <MdOutlineInventory2 />,
            label: "Products",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.products.list,
                  icon: <MdOutlineInventory2 />,
                  label: link(Paths.admin.products.list, "Products"),
                },
                allowedAccess: [Permissions.PRODUCTS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.products.inventory,
                  icon: <MdOutlineInventory2 />,
                  label: link(Paths.admin.products.inventory, "Inventory"),
                },
                allowedAccess: [Permissions.PRODUCTS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.rawMaterials.list,
                  icon: <MdOutlineInventory2 />,
                  label: link(Paths.admin.rawMaterials.list, "Raw Materials"),
                },
                allowedAccess: [Permissions.PRODUCTS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.production.list,
                  icon: <MdOutlineInventory2 />,
                  label: link(Paths.admin.production.list, "Production"),
                },
                allowedAccess: [Permissions.PRODUCTS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.variants.list,
                  icon: <MdOutlineCategory />,
                  label: link(Paths.admin.variants.list, "Variants"),
                },
                allowedAccess: [Permissions.VARIANTS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.productVariantOptions.list,
                  icon: <MdOutlineLayers />,
                  label: link(
                    Paths.admin.productVariantOptions.list,
                    "Variant Options",
                  ),
                },
                allowedAccess: [Permissions.PRODUCT_VARIANT_OPTIONS_READ],
              }),
            ],
          },
          allowedAccess: [
            Permissions.PRODUCTS_READ,
            Permissions.VARIANTS_READ,
            Permissions.PRODUCT_VARIANT_OPTIONS_READ,
          ],
        }),
        getContentAccess({
          content: {
            key: "trading",
            icon: <MdOutlinePointOfSale />,
            label: "Trading",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.purchases.list,
                  icon: <MdOutlineShoppingCart />,
                  label: link(Paths.admin.purchases.list, "Purchases"),
                },
                allowedAccess: [Permissions.PURCHASES_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.sales.list,
                  icon: <MdOutlinePointOfSale />,
                  label: link(Paths.admin.sales.list, "Sales"),
                },
                allowedAccess: [Permissions.SALES_READ],
              }),
            ],
          },
          allowedAccess: [Permissions.PURCHASES_READ, Permissions.SALES_READ],
        }),
        getContentAccess({
          content: {
            key: "reports",
            icon: <FaChartLine />,
            label: "Reports",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.profit.list,
                  icon: <FaChartLine />,
                  label: link(Paths.admin.profit.list, "Profit"),
                },
                allowedAccess: [Permissions.REPORTS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.loss.list,
                  icon: <FaChartBar />,
                  label: link(Paths.admin.loss.list, "Loss"),
                },
                allowedAccess: [Permissions.REPORTS_READ],
              }),
            ],
          },
          allowedAccess: [Permissions.REPORTS_READ],
        }),
        getContentAccess({
          content: {
            key: "administration",
            icon: <MdOutlineSettings />,
            label: "Administration",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.users.list,
                  icon: <FaUsers />,
                  label: link(Paths.admin.users.list, "Users"),
                },
                allowedAccess: [Permissions.USERS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.roleManager.root,
                  icon: <FaUserShield />,
                  label: "Role Manager",
                  children: [
                    getContentAccess({
                      content: {
                        key: Paths.admin.roleManager.permissionTypes.list,
                        icon: <RiUserStarFill />,
                        label: link(
                          Paths.admin.roleManager.permissionTypes.list,
                          "Permission Types",
                        ),
                      },
                      allowedAccess: [
                        Permissions.ROLE_MANAGER_PERMISSION_TYPES_READ,
                      ],
                    }),
                    getContentAccess({
                      content: {
                        key: Paths.admin.roleManager.permissions.list,
                        icon: <FaUserTag />,
                        label: link(
                          Paths.admin.roleManager.permissions.list,
                          "Permissions",
                        ),
                      },
                      allowedAccess: [
                        Permissions.ROLE_MANAGER_PERMISSIONS_READ,
                      ],
                    }),
                    getContentAccess({
                      content: {
                        key: Paths.admin.roleManager.roles.list,
                        icon: <GrUserAdmin />,
                        label: link(
                          Paths.admin.roleManager.roles.list,
                          "Roles",
                        ),
                      },
                      allowedAccess: [Permissions.ROLE_MANAGER_ROLES_READ],
                    }),
                  ],
                },
                allowedAccess: [
                  Permissions.ROLE_MANAGER_PERMISSION_TYPES_READ,
                  Permissions.ROLE_MANAGER_PERMISSIONS_READ,
                  Permissions.ROLE_MANAGER_ROLES_READ,
                ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.settings.root,
                  icon: <MdOutlineSettings />,
                  label: link(Paths.admin.settings.root, "Settings", false),
                },
                allowedAccess: [Permissions.SETTINGS_READ],
              }),
            ],
          },
          allowedAccess: [
            Permissions.USERS_READ,
            Permissions.ROLE_MANAGER_PERMISSION_TYPES_READ,
            Permissions.ROLE_MANAGER_PERMISSIONS_READ,
            Permissions.ROLE_MANAGER_ROLES_READ,
            Permissions.SETTINGS_READ,
          ],
        }),
      ]}
    />
  );
};

export default AdminMenu;
