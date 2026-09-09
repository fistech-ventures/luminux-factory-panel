import CustomLink from "@base/components/CustomLink";
import { Paths, Permissions } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import { getContentAccess } from "@modules/auth/lib/utils/client";
import { Menu } from "antd";
import { FaUsers, FaUserShield, FaUserTag, FaBook, FaChartLine, FaChartBar } from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";
import { RiUserStarFill } from "react-icons/ri";
import {
  MdDashboard,
  MdOutlinePointOfSale,
  MdOutlineShoppingCart,
  MdOutlineInventory2,
  MdOutlineCategory,
  MdOutlineLayers,
  MdOutlinePeopleOutline,
  MdOutlineHandshake,
  MdOutlineReceiptLong,
  MdOutlinePhotoLibrary,
  MdOutlineSettings,
  MdAccountBalance,
  MdPayment,
} from "react-icons/md";

interface IProps {
  className?: string;
  selectedKeys: string[];
  openKeys: string[];
  onOpenChange: (openKeys: string[]) => void;
}

const AdminMenu: React.FC<IProps> = ({ className, selectedKeys, openKeys, onOpenChange }) => {
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
          label: <CustomLink href={Paths.admin.root}>Dashboard</CustomLink>,
        },
        getContentAccess({
          content: {
            key: Paths.admin.sales.list,
            icon: <MdOutlinePointOfSale />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.sales.list)}>
                Sales
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.SALES_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.purchases.list,
            icon: <MdOutlineShoppingCart />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.purchases.list)}>
                Purchases
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.PURCHASES_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.products.list,
            icon: <MdOutlineInventory2 />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.products.list)}>
                Products
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.PRODUCTS_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.variants.list,
            icon: <MdOutlineCategory />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.variants.list)}>
                Variants
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.VARIANTS_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.productVariantOptions.list,
            icon: <MdOutlineLayers />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.productVariantOptions.list)}>
                Variant Options
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.PRODUCT_VARIANT_OPTIONS_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.customers.list,
            icon: <MdOutlinePeopleOutline />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.customers.list)}>
                Customers
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.CUSTOMERS_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.suppliers.list,
            icon: <MdOutlineHandshake />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.suppliers.list)}>
                Suppliers
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.SUPPLIERS_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.expenses.list,
            icon: <MdOutlineReceiptLong />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.expenses.list)}>
                Expenses
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.EXPENSES_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.ledger.list,
            icon: <FaBook />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.ledger.list)}>
                Ledger
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.LEDGER_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.profit.list,
            icon: <FaChartLine />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.profit.list)}>
                Profit
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.SALES_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.loss.list,
            icon: <FaChartBar />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.loss.list)}>
                Loss
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.SALES_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.accounts.list,
            icon: <MdAccountBalance />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.accounts.list)}>
                Accounts
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.SALES_READ, Permissions.PURCHASES_READ, Permissions.EXPENSES_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.payments.list,
            icon: <MdPayment />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.payments.list)}>
                Payments
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.PAYMENTS_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.gallery.list,
            icon: <MdOutlinePhotoLibrary />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.gallery.list)}>
                Gallery
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.GALLERY_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.users.list,
            icon: <FaUsers />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.users.list)}>
                Users
              </CustomLink>
            ),
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
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.roleManager.permissionTypes.list,
                      )}
                    >
                      Permission Types
                    </CustomLink>
                  ),
                },
                allowedAccess: [Permissions.ROLE_MANAGER_PERMISSION_TYPES_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.roleManager.permissions.list,
                  icon: <FaUserTag />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.roleManager.permissions.list,
                      )}
                    >
                      Permissions
                    </CustomLink>
                  ),
                },
                allowedAccess: [Permissions.ROLE_MANAGER_PERMISSIONS_READ],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.roleManager.roles.list,
                  icon: <GrUserAdmin />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.roleManager.roles.list,
                      )}
                    >
                      Roles
                    </CustomLink>
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
            label: (
              <CustomLink href={Paths.admin.settings.root}>Settings</CustomLink>
            ),
          },
          allowedAccess: [Permissions.SETTINGS_READ],
        }),
      ]}
    />
  );
};

export default AdminMenu;