import CustomLink from "@base/components/CustomLink";
import { Paths } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import { getContentAccess } from "@modules/auth/lib/utils/client";
import { Menu } from "antd";
import { FaUsers, FaUserShield, FaUserTag, FaBook } from "react-icons/fa";
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
          allowedAccess: ["sales:read"],
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
          allowedAccess: ["purchases:read"],
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
          allowedAccess: ["products:read"],
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
          allowedAccess: ["variants:read"],
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
          allowedAccess: ["product-variant-options:read"],
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
          allowedAccess: ["customers:read"],
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
          allowedAccess: ["suppliers:read"],
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
          allowedAccess: ["expenses:read"],
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
          allowedAccess: ["ledger:read"],
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
          allowedAccess: ["gallery:read"],
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
          allowedAccess: ["users:read"],
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
                allowedAccess: ["role-manager-permission-types:read"],
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
                allowedAccess: ["role-manager-permissions:read"],
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
                allowedAccess: ["role-manager-roles:read"],
              }),
            ],
          },
          allowedAccess: [
            "role-manager-permission-types:read",
            "role-manager-permissions:read",
            "role-manager-roles:read",
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
          allowedAccess: ["settings:read"],
        }),
      ]}
    />
  );
};

export default AdminMenu;