import { Button, Dropdown, MenuProps } from "antd";
import React from "react";
import { FiMoreVertical } from "react-icons/fi";

interface IProps {
  items?: MenuProps["items"];
  content?: React.ReactNode;
}

const getActionLabel = (element: React.ReactElement<any>) => {
  if (element.props.title) return element.props.title;
  if (typeof element.props.children === "string") return element.props.children;

  const iconName =
    element.props.icon?.type?.displayName ||
    element.props.icon?.type?.name ||
    "";
  const labels: Record<string, string> = {
    AiFillDelete: "Delete",
    AiFillEdit: "Edit",
    AiOutlineEye: "View details",
    FaBook: "View ledger",
    FiFileText: "Open invoice",
    FiPrinter: "Print invoice",
  };

  return labels[iconName] || "Action";
};

const renderLabeledActions = (node: React.ReactNode): React.ReactNode =>
  React.Children.toArray(node).flatMap((child) => {
    if (!React.isValidElement(child)) return [];
    const element = child as React.ReactElement<any>;

    if (element.type === Button) {
      const buttonChildren = React.Children.toArray(element.props.children);
      const actionIcon =
        element.props.icon ||
        buttonChildren.find((buttonChild) => React.isValidElement(buttonChild));

      return React.cloneElement(element, {
        className: `${element.props.className || ""} w-full! flex! items-center! justify-start! text-left! rounded-none! border-none!`,
        icon: undefined,
        children: (
          <>
            <span className="inline-flex w-5 shrink-0 items-center justify-center">
              {actionIcon}
            </span>
            <span className="ml-2">{getActionLabel(element)}</span>
          </>
        ),
      });
    }

    return element.props.children
      ? renderLabeledActions(element.props.children)
      : [];
  });

const ActionMenu: React.FC<IProps> = ({ items, content }) => (
  <Dropdown
    menu={items ? { items } : undefined}
    dropdownRender={
      content
        ? () => (
            <div className="min-w-44! p-1! flex! flex-col! border border-gray-200 bg-white">
              {renderLabeledActions(content)}
            </div>
          )
        : undefined
    }
    trigger={["click"]}
    placement="bottomRight"
  >
    <Button
      type="text"
      icon={<FiMoreVertical />}
      aria-label="Actions"
      title="Actions"
    />
  </Dropdown>
);

export default ActionMenu;
