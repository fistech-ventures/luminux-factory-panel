import ConfirmationDialog from "@base/components/ConfirmationDialog";
import ActionMenu from "@base/components/ActionMenu";
import CustomSwitch from "@base/components/CustomSwitch";
import { Toolbox } from "@lib/utils";
import { getAccess } from "@modules/auth/lib/utils/client";
import type { PaginationProps, TableColumnsType } from "antd";
import { Button, Drawer, Form, Table, Tag, message } from "antd";
import React, { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { VariantsHooks } from "../lib/hooks";
import { IVariant } from "../lib/interfaces";
import VariantsForm from "./VariantsForm";

interface IProps {
  isLoading: boolean;
  data: IVariant[];
  pagination: PaginationProps;
}

const VariantsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IVariant>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: "", content: "", onConfirm: () => {} });

  // Any option flagged for removal is soft-deleted from the API, so the
  // UI never hard-deletes an option. If the user removes a row from the
  // list (isDeleted: true), we confirm before sending the update.
  const [optionDeletionDialog, setOptionDeletionDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: "", content: "", onConfirm: () => {} });

  const variantUpdateFn = VariantsHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        messageApi.success(res.message);
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    title: elem?.title,
    options: elem?.options,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: "title",
      dataIndex: "title",
      title: "Title",
    },
    {
      key: "options",
      dataIndex: "options",
      title: "Options",
      render: (options) =>
        options?.length ? (
          <div className="flex flex-wrap gap-1">
            {options.map((option) => (
              <Tag key={option?.id || option?.title}>{option?.title}</Tag>
            ))}
          </div>
        ) : (
          "N/A"
        ),
    },
    {
      key: "isActive",
      dataIndex: "isActive",
      title: "Active",
      render: (isActive, record) => {
        return (
          <CustomSwitch
            checked={isActive}
            onChange={(checked) => {
              getAccess(["variants:update"], () => {
                const action = checked ? "activate" : "deactivate";
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Variant`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    variantUpdateFn.mutate({
                      id: record?.id,
                      data: {
                        isActive: checked,
                      },
                    });
                    setConfirmationDialog({
                      open: false,
                      title: "",
                      content: "",
                      onConfirm: () => {},
                    });
                  },
                });
              });
            }}
          />
        );
      },
    },
    {
      key: "id",
      dataIndex: "id",
      title: "Action",
      align: "center",
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <ActionMenu
            content={
              <div className="flex flex-col gap-1">
                <Button
                  title="Edit variant"
                  onClick={() => {
                    getAccess(["variants:update"], () => {
                      formInstance.resetFields();
                      setUpdateItem(item);
                    });
                  }}
                >
                  <AiFillEdit />
                </Button>
              </div>
            }
          />
        );
      },
    },
  ];

  return (
    <React.Fragment>
      {messageHolder}
      <Table
        loading={isLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        scroll={{ x: true }}
      />
      <Drawer
        width={640}
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <VariantsForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            isActive: updateItem?.isActive,
          }}
          isLoading={variantUpdateFn.isPending}
          onFinish={(values) => {
            const initialOptions = (updateItem?.options ?? []).map(
              (option) => ({
                id: option?.id,
                title: option?.title,
                isActive: option?.isActive,
              }),
            );
            const diffs = Toolbox.computeArrayDiffs<any>(
              initialOptions,
              values?.options ?? [],
              "id",
            );

            // A diff that has an id is an existing option. If the id is missing
            // (e.g. the form lost the id), we treat it as a NEW option instead of
            // assuming the original was deleted.
            const hasOptionId = (diff: any) => Boolean(diff?.id);

            const deletedDiffs = diffs.filter((diff: any) =>
              Boolean(diff?.isDeleted),
            );

            // If any existing option is being deleted, confirm first.
            if (deletedDiffs.length > 0) {
              const optionTitles = deletedDiffs
                .map((diff: any) => diff?.title ?? "Unknown")
                .join(", ");
              setOptionDeletionDialog({
                open: true,
                title: "Delete variant option(s)?",
                content:
                  `You are about to delete the following option(s): ${optionTitles}. ` +
                  "This marks the option as deleted in the database. It is never hard-deleted, " +
                  "so any product or SKU combinations still referencing it will keep working.",
                onConfirm: () => {
                  setOptionDeletionDialog({
                    open: false,
                    title: "",
                    content: "",
                    onConfirm: () => {},
                  });
                  variantUpdateFn.mutate({
                    id: updateItem?.id,
                    data: {
                      ...values,
                      options: diffs.map((diff: any) =>
                        hasOptionId(diff)
                          ? diff
                          : Toolbox.omitProps(diff, ["id"]),
                      ),
                    },
                  });
                },
              });
              return;
            }

            variantUpdateFn.mutate({
              id: updateItem?.id,
              data: {
                ...values,
                options: diffs.map((diff: any) =>
                  hasOptionId(diff) ? diff : Toolbox.omitProps(diff, ["id"]),
                ),
              },
            });
          }}
        />
      </Drawer>
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() =>
          setConfirmationDialog({
            open: false,
            title: "",
            content: "",
            onConfirm: () => {},
          })
        }
      />
      <ConfirmationDialog
        open={optionDeletionDialog.open}
        title={optionDeletionDialog.title}
        content={optionDeletionDialog.content}
        onConfirm={optionDeletionDialog.onConfirm}
        onCancel={() =>
          setOptionDeletionDialog({
            open: false,
            title: "",
            content: "",
            onConfirm: () => {},
          })
        }
      />
    </React.Fragment>
  );
};

export default VariantsList;
