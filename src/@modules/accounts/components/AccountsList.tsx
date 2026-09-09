import { IAccountTransaction } from "@modules/accounts/lib/interfaces";
import { Table, TableColumnsType, Tag } from "antd";
import dayjs from "dayjs";

interface IProps {
  isLoading?: boolean;
  data?: IAccountTransaction[];
  pagination?: any;
}

const AccountsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
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
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "N/A"),
    },
    {
      key: "transactionType",
      dataIndex: "transactionType",
      title: "Type",
      render: (type) => (
        <Tag color={type === "CASH_IN" ? "green" : "red"}>
          {type === "CASH_IN" ? "Cash In" : "Cash Out"}
        </Tag>
      ),
    },
    {
      key: "paymentMethod",
      dataIndex: "paymentMethod",
      title: "Payment Method",
      render: (method) => method || "N/A",
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
      render: (type) => type || "N/A",
    },
    {
      key: "referenceId",
      dataIndex: "referenceId",
      title: "Reference ID",
      render: (id) => id || "N/A",
    },
    {
      key: "entityType",
      dataIndex: "entityType",
      title: "Entity Type",
      render: (type) => type || "N/A",
    },
    {
      key: "description",
      dataIndex: "description",
      title: "Description",
      render: (desc) => desc || "N/A",
    },
  ];

  return (
    <Table
      loading={isLoading}
      dataSource={dataSource}
      columns={columns}
      pagination={pagination}
      scroll={{ x: true }}
    />
  );
};

export default AccountsList;
