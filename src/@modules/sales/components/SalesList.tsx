import ConfirmationDialog from "@base/components/ConfirmationDialog";
import ActionMenu from "@base/components/ActionMenu";
import RecordDetailsModal from "@base/components/RecordDetailsModal";
import { getAccess } from "@modules/auth/lib/utils/client";
import type { PaginationProps, TableColumnsType } from "antd";
import { Button, Drawer, Form, Table, message } from "antd";
import React, { useState } from "react";
import { AiFillEdit, AiFillDelete, AiOutlineEye } from "react-icons/ai";
import { FiFileText, FiPrinter } from "react-icons/fi";
import { SalesHooks } from "../lib/hooks";
import { ISale } from "../lib/interfaces";
import SalesForm from "./SalesForm";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getSaleItemDetails = (item: ISale['items'][number]) => {
  if (item.sku) {
    const values = (item.sku.values ?? [])
      .map((value) => [value.variant?.title, value.variantOption?.title].filter(Boolean).join(": "))
      .filter(Boolean)
      .join(", ");
    return values || item.sku.name || "";
  }

  return [item.variant?.variant?.title, item.variant?.variantOption?.title]
    .filter(Boolean)
    .join(": ");
};

const printSale = (sale: ISale) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  const items = (sale.items ?? [])
    .map(
      (item, index) => `
        <tr><td>${index + 1}</td><td><strong>${escapeHtml(item.product?.title)}</strong>${getSaleItemDetails(item) ? `<small>${escapeHtml(getSaleItemDetails(item))}</small>` : ""}${item.product?.warranty ? `<small>Warranty: ${escapeHtml(item.product.warranty)}</small>` : ""}</td><td class="num">${item.quantity}${item.sku?.unit || item.product?.unit ? ` ${escapeHtml(item.sku?.unit || item.product?.unit)}` : ""}</td><td class="num">${Number(item.sellingPrice ?? 0).toFixed(2)}</td><td class="num">${Number(item.totalAmount ?? item.totalPrice ?? item.quantity * item.sellingPrice).toFixed(2)}</td></tr>`,
    )
    .join("");

  printWindow.document
    .write(`<!doctype html><html><head><title>Invoice ${escapeHtml(sale.invoiceNo)}</title><style>
    @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:12px Arial;color:#000}.page{width:210mm;min-height:297mm;padding:42mm 20px 32mm;display:flex;flex-direction:column;margin:auto}.title{text-align:center;font-size:28px;font-weight:bold;text-decoration:underline;margin-bottom:18px}.meta,.parties{display:flex;justify-content:space-between;margin-bottom:18px}.meta{border-bottom:1px solid #000;padding-bottom:8px}.party{width:48%}.party:last-child{text-align:right}.party h3{font-size:12px;border-bottom:1px solid #000;padding-bottom:4px}.party .name{font-weight:bold;font-size:13px}.detail,small{display:block;margin-top:3px}.items{width:100%;border-collapse:collapse;margin-top:14px}.items th{background:#2B4837;color:#fff}.items th,.items td{border:1px solid #000;padding:5px}.num{text-align:right}.summary{display:flex;justify-content:flex-end;margin-top:18px}.summary-box{width:220px;border:1px solid #000}.summary-row{display:flex;justify-content:space-between;padding:5px;border-bottom:1px solid #ddd}.summary-row:last-child{border:0}.total{font-weight:bold;background:#e8e8e8}.signatures{display:flex;justify-content:space-between;margin-top:auto;padding-top:65px}.signature{width:200px;text-align:center;border-top:1px solid #000;padding-top:5px;font-weight:bold}
  </style></head><body><main class="page"><div class="title">INVOICE</div><div class="meta"><span>DATE: ${escapeHtml(sale.date)}</span><span>INVOICE NO: ${escapeHtml(sale.invoiceNo)}</span></div><section class="parties"><div class="party"><h3>BILL TO</h3><div class="name">${escapeHtml(sale.customer?.companyName ? `${escapeHtml(sale.customer.companyName)}` : `${escapeHtml(sale.customer.name)}`)}</div><div class="detail">${sale.customer?.contactNumber ? `Phone: ${escapeHtml(sale.customer.contactNumber)}` : ""}${sale.customer?.address ? `<br>${escapeHtml(sale.customer.address)}` : ""}</div></div><div class="party"><h3>SHIP TO</h3><div class="name">${escapeHtml(sale.shippingTo)}</div><div class="detail">${escapeHtml(sale.shippingContact ? `Phone: ${escapeHtml(sale.shippingContact)}` : "")}</div><div class="detail">${escapeHtml(sale.shippingAddress)}</div></div></section><table class="items"><thead><tr><th>SL</th><th>DESCRIPTION</th><th>QNTY</th><th>UNIT PRICE</th><th>TOTAL</th></tr></thead><tbody>${items}</tbody></table><div class="summary"><div class="summary-box"><div class="summary-row"><span>Total Amount</span><span>${Number(sale.totalAmount ?? 0).toFixed(2)}</span></div><div class="summary-row"><span>Discount</span><span>${Number(sale.discount ?? 0).toFixed(2)}</span></div><div class="summary-row total"><span>Grand Total</span><span>${Number(sale.grandTotal ?? 0).toFixed(2)}</span></div><div class="summary-row"><span>Paid Amount</span><span>${Number(sale.paidAmount ?? 0).toFixed(2)}</span></div><div class="summary-row"><span>Due Amount</span><span>${Number(sale.dueAmount ?? 0).toFixed(2)}</span></div></div></div><div class="signatures"><div class="signature">Received By</div><div class="signature">Prepared By</div></div></main></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

interface IProps {
  isLoading: boolean;
  data: ISale[];
  pagination: PaginationProps;
}

const SalesList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<ISale>(null);
  const [detailsItem, setDetailsItem] = useState<ISale>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: "", content: "", onConfirm: () => {} });

  const saleUpdateFn = SalesHooks.useUpdate({
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

  const saleDeleteFn = SalesHooks.useDelete({
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
    key: elem?.id,
    id: elem?.id,
    date: elem?.date,
    invoiceNo: elem?.invoiceNo,
    customerName: elem?.customer?.companyName,
    itemsCount: elem?.items?.length,
    totalAmount: elem?.totalAmount,
    discount: elem?.discount,
    grandTotal: elem?.grandTotal,
    paidAmount: elem?.paidAmount,
    dueAmount: elem?.dueAmount,
    paymentMethod: elem?.paymentMethod,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: "date",
      dataIndex: "date",
      title: "Date",
    },
    {
      key: "invoiceNo",
      dataIndex: "invoiceNo",
      title: "Invoice",
      render: (invoiceNo) => invoiceNo || "N/A",
    },
    {
      key: "customerName",
      dataIndex: "customerName",
      title: "Customer",
      render: (customerName) => customerName || "N/A",
    },
    {
      key: "itemsCount",
      dataIndex: "itemsCount",
      title: "Items",
      render: (itemsCount) => itemsCount ?? 0,
    },
    {
      key: "totalAmount",
      dataIndex: "totalAmount",
      title: "Total",
      render: (totalAmount) =>
        totalAmount != null ? Number(totalAmount).toFixed(2) : "N/A",
    },
    {
      key: "discount",
      dataIndex: "discount",
      title: "Discount",
      render: (discount) =>
        discount != null ? Number(discount).toFixed(2) : "N/A",
    },
    {
      key: "grandTotal",
      dataIndex: "grandTotal",
      title: "Grand Total",
      render: (grandTotal) =>
        grandTotal != null ? Number(grandTotal).toFixed(2) : "N/A",
    },
    {
      key: "paidAmount",
      dataIndex: "paidAmount",
      title: "Paid",
      render: (paidAmount) =>
        paidAmount != null ? Number(paidAmount).toFixed(2) : "N/A",
    },
    {
      key: "dueAmount",
      dataIndex: "dueAmount",
      title: "Due",
      render: (dueAmount) =>
        dueAmount != null ? Number(dueAmount).toFixed(2) : "N/A",
    },
    {
      key: "paymentMethod",
      dataIndex: "paymentMethod",
      title: "Payment",
      render: (paymentMethod) => paymentMethod || "N/A",
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
              <div className="flex gap-2">
                <Button
                  title="Open invoice"
                  onClick={() => {
                    getAccess(["sales:read"], () => {
                      if (item?.invoiceUrl) {
                        window.open(item.invoiceUrl, "_blank");
                      }
                    });
                  }}
                >
                  <FiFileText />
                </Button>
                <Button
                  title="Print invoice"
                  onClick={() => {
                    getAccess(["sales:read"], () => printSale(item));
                  }}
                >
                  <FiPrinter />
                </Button>
                <Button
                  title="View details"
                  onClick={() => {
                    getAccess(["sales:read"], () => {
                      setDetailsItem(item);
                    });
                  }}
                >
                  <AiOutlineEye />
                </Button>
                <Button
                  title="Edit sale"
                  onClick={() => {
                    getAccess(["sales:update"], () => {
                      formInstance.resetFields();
                      setUpdateItem(item);
                    });
                  }}
                >
                  <AiFillEdit />
                </Button>
                <Button
                  title="Delete sale"
                  danger
                  onClick={() => {
                    getAccess(["sales:delete"], () => {
                      setConfirmationDialog({
                        open: true,
                        title: "Delete Sale",
                        content: `Are you sure you want to delete sale "${item.invoiceNo}"?`,
                        onConfirm: () => {
                          saleDeleteFn.mutate(item.id);
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
        width={860}
        title={`Update Sale - ${updateItem?.invoiceNo}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <SalesForm
          key={updateItem?.id}
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            customer: updateItem?.customer,
            createdBy: undefined,
          }}
          isLoading={saleUpdateFn.isPending}
          onFinish={(values) =>
            saleUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
      <RecordDetailsModal
        open={!!detailsItem?.id}
        onClose={() => setDetailsItem(null)}
        resource="sale"
        id={detailsItem?.id}
        title={`Sale Details - ${detailsItem?.invoiceNo ?? ""}`}
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

export default SalesList;
