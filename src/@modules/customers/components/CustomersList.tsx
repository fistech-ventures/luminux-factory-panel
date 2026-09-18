import ConfirmationDialog from "@base/components/ConfirmationDialog";
import ActionMenu from "@base/components/ActionMenu";
import RecordDetailsModal from "@base/components/RecordDetailsModal";
import { Paths } from "@lib/constant";
import { getAccess } from "@modules/auth/lib/utils/client";
import type { PaginationProps, TableColumnsType } from "antd";
import { Button, Drawer, Form, Table, message } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiFillEdit, AiFillDelete, AiOutlineEye } from "react-icons/ai";
import { FaBook } from "react-icons/fa";
import { CustomersHooks } from "../lib/hooks";
import { ICustomer } from "../lib/interfaces";
import CustomersForm from "./CustomersForm";

interface IProps {
  isLoading: boolean;
  data: ICustomer[];
  pagination: PaginationProps;
}

const CustomersList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const router = useRouter();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<ICustomer>(null);
  const [detailsItem, setDetailsItem] = useState<ICustomer>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: "", content: "", onConfirm: () => {} });

  const customerUpdateFn = CustomersHooks.useUpdate({
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

  const customerDeleteFn = CustomersHooks.useDelete({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
        messageApi.success(res.message);
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    customerType: elem?.customerType,
    key: elem?.id,
    id: elem?.id,
    name: elem?.name,
    contactNumber: elem?.contactNumber,
    email: elem?.email,
    address: elem?.address,
    companyName: elem?.companyName,
    createdBy: elem?.createdBy,
    updatedBy: elem?.updatedBy,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: "customerType",
      dataIndex: "customerType",
      title: "Type",
    },
    {
      key: "name",
      dataIndex: "name",
      title: "Name",
    },
    {
      key: "contactNumber",
      dataIndex: "contactNumber",
      title: "Contact Number",
      render: (contactNumber) => contactNumber || "N/A",
    },
    {
      key: "email",
      dataIndex: "email",
      title: "Email",
      render: (email) => email || "N/A",
    },
    {
      key: "companyName",
      dataIndex: "companyName",
      title: "Company",
      render: (companyName) => companyName || "N/A",
    },
    {
      key: "address",
      dataIndex: "address",
      title: "Address",
      render: (address) => address || "N/A",
    },
    {
      key: "createdBy",
      dataIndex: "createdBy",
      title: "Created By",
      render: (createdBy) => createdBy?.fullName || "N/A",
    },
    {
      key: "updatedBy",
      dataIndex: "updatedBy",
      title: "Updated By",
      render: (updatedBy) => updatedBy?.fullName || "N/A",
    },
    {
      key: "id",
      dataIndex: "id",
      title: "Action",
      align: "center",
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <ActionMenu content={<div className="flex flex-col gap-1">
            <Button
              title="View ledger"
              onClick={() => {
                getAccess(["customers:read"], () => {
                  router.push(
                    `${Paths.admin.ledger.list}?entityType=customer&entityId=${id}`,
                  );
                });
              }}
            >
              <FaBook />
            </Button>
            <Button
              title="View details"
              onClick={() => {
                getAccess(["customers:read"], () => {
                  setDetailsItem(item);
                });
              }}
            >
              <AiOutlineEye />
            </Button>
            <Button
              title="Edit customer"
              onClick={() => {
                getAccess(["customers:update"], () => {
                  formInstance.resetFields();
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              title="Delete customer"
              danger
              onClick={() => {
                getAccess(["customers:delete"], () => {
                  setConfirmationDialog({
                    open: true,
                    title: "Delete Customer",
                    content: `Are you sure you want to delete "${item.name}"?`,
                    onConfirm: () => {
                      customerDeleteFn.mutate(item.id);
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
            >
              <AiFillDelete />
            </Button>
          </div>} />
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
        title={`Update ${updateItem?.name}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <CustomersForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            createdBy: undefined,
          }}
          isLoading={customerUpdateFn.isPending}
          onFinish={(values) =>
            customerUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="customer"
        id={detailsItem?.id}
        title={`Customer Details - ${detailsItem?.name ?? ""}`}
      />
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
    </React.Fragment>
  );
};

export default CustomersList;
