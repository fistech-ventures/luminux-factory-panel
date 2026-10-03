import RecordDetailsModal from "@base/components/RecordDetailsModal";
import ActionMenu from "@base/components/ActionMenu";
import { IAccountTransaction } from "@modules/accounts/lib/interfaces";
import { getAccess } from "@modules/auth/lib/utils/client";
import { Button, Table, TableColumnsType, Tag } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { AiOutlineEye } from "react-icons/ai";

interface IProps {
  isLoading?: boolean;
  data?: IAccountTransaction[];
  pagination?: any;
}

const AccountsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [detailsRef, setDetailsRef] = useState<{
    resource: string;
    id: string;
  } | null>(null);

  const dataSource = data?.map((transaction) => ({
    key: transaction?.id,
    transactionDate: transaction?.transactionDate,
    transactionType: transaction?.transactionType,
    paymentMethod: transaction?.paymentMethod,
    amount: transaction?.amount,
    referenceType: transaction?.referenceType,
    referenceId: transaction?.referenceId,
    description: transaction?.description,
    entityType: transaction?.entityType,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: "transactionDate",
      dataIndex: "transactionDate",
      title: "Date",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      key: "transactionType",
      dataIndex: "transactionType",
      title: "Type",
      render: (type) => (
        <Tag color={type === "cashIn" ? "green" : "red"}>
          {type === "cashIn" ? "Cash In" : "Cash Out"}
        </Tag>
      ),
    },
    {
      key: "paymentMethod",
      dataIndex: "paymentMethod",
      title: "Payment Method",
      render: (method) =>
        method?.charAt(0).toUpperCase() + method?.slice(1) || "N/A",
    },
    {
      key: "amount",
      dataIndex: "amount",
      title: "Amount",
      render: (amount) => (amount != null ? Number(amount).toFixed(2) : "N/A"),
    },
    {
      key: "referenceType",
      dataIndex: "referenceType",
      title: "Reference Type",
      render: (type) => type?.charAt(0).toUpperCase() + type?.slice(1) || "N/A",
    },
    {
      key: "reference",
      dataIndex: "referenceId",
      title: "Reference ID",
      render: (id) => id || "N/A",
    },
    {
      key: "entityType",
      dataIndex: "entityType",
      title: "Entity Type",
      render: (type) => type?.charAt(0).toUpperCase() + type?.slice(1) || "N/A",
    },
    {
      key: "description",
      dataIndex: "description",
      title: "Description",
      render: (desc) => desc || "N/A",
    },
    {
      key: "action",
      dataIndex: "referenceId",
      title: "Action",
      align: "center",
      render: (referenceId, record) => {
        // The reference type decides which details API is called (purchase/{id}, expense/{id}, ...).
        if (!record?.referenceType || !referenceId) return "N/A";

        return (
          <ActionMenu content={<Button
            title="View details"
            icon={<AiOutlineEye />}
            onClick={() => {
              getAccess(
                ["sales:read", "purchases:read", "expenses:read"],
                () => {
                  setDetailsRef({
                    resource: record.referenceType,
                    id: String(referenceId),
                  });
                },
              );
            }}
          />} />
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Table
        loading={isLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        scroll={{ x: true }}
      />
      <RecordDetailsModal
        open={!!detailsRef?.id}
        onClose={() => setDetailsRef(null)}
        resource={detailsRef?.resource}
        id={detailsRef?.id}
      />
    </React.Fragment>
  );
};

export default AccountsList;
