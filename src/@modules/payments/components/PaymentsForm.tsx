import InfiniteScrollSelect from "@base/components/InfiniteScrollSelect";
import { ENUM_PAYMENT_METHODS } from "@lib/constant";
import { CustomersHooks } from "@modules/customers/lib/hooks";
import { ICustomer } from "@modules/customers/lib/interfaces";
import { PurchasesHooks } from "@modules/purchases/lib/hooks";
import { IPurchase } from "@modules/purchases/lib/interfaces";
import { SalesHooks } from "@modules/sales/lib/hooks";
import { ISale } from "@modules/sales/lib/interfaces";
import { SuppliersHooks } from "@modules/suppliers/lib/hooks";
import { ISupplier } from "@modules/suppliers/lib/interfaces";
import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { IPaymentCreate } from "../lib/interfaces";

const PAYMENT_METHODS = ENUM_PAYMENT_METHODS as readonly string[];

interface IProps {
  form: any;
  initialValues?: Partial<IPaymentCreate>;
  isLoading?: boolean;
  onFinish: (values: IPaymentCreate) => void;
}

const PaymentsForm: React.FC<IProps> = ({ form, initialValues, isLoading, onFinish }) => {
  const entityType = Form.useWatch("entityType", form);
  const referenceType = Form.useWatch("referenceType", form);
  const [entitySearchTerm, setEntitySearchTerm] = useState(null);
  const [referenceSearchTerm, setReferenceSearchTerm] = useState(null);

  const customersQuery = CustomersHooks.useFindInfinite({
    options: { limit: 20, searchTerm: entityType === "customer" ? entitySearchTerm : null },
    config: { queryKey: [], enabled: entityType === "customer" },
  });
  const suppliersQuery = SuppliersHooks.useFindInfinite({
    options: { limit: 20, searchTerm: entityType === "supplier" ? entitySearchTerm : null },
    config: { queryKey: [], enabled: entityType === "supplier" },
  });
  const salesQuery = SalesHooks.useFindInfinite({
    options: { limit: 20, searchTerm: referenceType === "sale" ? referenceSearchTerm : null },
    config: { queryKey: [], enabled: referenceType === "sale" },
  });
  const purchasesQuery = PurchasesHooks.useFindInfinite({
    options: { limit: 20, searchTerm: referenceType === "purchase" ? referenceSearchTerm : null },
    config: { queryKey: [], enabled: referenceType === "purchase" },
  });

  const customerQuery = CustomersHooks.useFindById({
    id: initialValues?.entityType === "customer" ? initialValues.entityId : undefined,
    config: { queryKey: [], enabled: initialValues?.entityType === "customer" && !!initialValues.entityId },
  });
  const supplierQuery = SuppliersHooks.useFindById({
    id: initialValues?.entityType === "supplier" ? initialValues.entityId : undefined,
    config: { queryKey: [], enabled: initialValues?.entityType === "supplier" && !!initialValues.entityId },
  });
  const saleQuery = SalesHooks.useFindById({
    id: initialValues?.referenceType === "sale" ? initialValues.referenceId : undefined,
    config: { queryKey: [], enabled: initialValues?.referenceType === "sale" && !!initialValues.referenceId },
  });
  const purchaseQuery = PurchasesHooks.useFindById({
    id: initialValues?.referenceType === "purchase" ? initialValues.referenceId : undefined,
    config: { queryKey: [], enabled: initialValues?.referenceType === "purchase" && !!initialValues.referenceId },
  });

  const customerInitial = customerQuery.data?.data ? [customerQuery.data.data] : [];
  const supplierInitial = supplierQuery.data?.data ? [supplierQuery.data.data] : [];
  const saleInitial = saleQuery.data?.data ? [saleQuery.data.data] : [];
  const purchaseInitial = purchaseQuery.data?.data ? [purchaseQuery.data.data] : [];

  const customerLabel = (customer: ICustomer) => `${customer.name} (${customer.contactNumber})`;
  const supplierLabel = (supplier: ISupplier) => `${supplier.companyName} (${supplier.contactNumber})`;
  const saleLabel = (sale: ISale) => `${sale.customer?.companyName} - ${sale.date} - ${sale.invoiceNo} - ${Number(sale.grandTotal || 0).toFixed(2)}`;
  const purchaseLabel = (purchase: IPurchase) =>
    `${purchase.supplier?.companyName || purchase.supplierId} - ${purchase.purchaseDate} - ${Number(purchase.totalPurchaseAmount || 0).toFixed(2)}`;

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        paymentDate: initialValues?.paymentDate ? dayjs(initialValues.paymentDate) : dayjs(),
      }}
      onFinish={(values) => {
        onFinish({
          ...values,
          paymentDate: values.paymentDate ? values.paymentDate.toISOString() : new Date().toISOString(),
        });
      }}
    >
      <Form.Item name="entityType" label="Entity Type" rules={[{ required: true, message: "Please select entity type" }]}>
        <Select placeholder="Select entity type" onChange={() => form.setFieldValue("entityId", undefined)}>
          <Select.Option value="customer">Customer</Select.Option>
          <Select.Option value="supplier">Supplier</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="entityId"
        label={entityType === "supplier" ? "Supplier" : "Customer"}
        rules={[{ required: true, message: "Please select entity" }]}
      >
        <InfiniteScrollSelect<ICustomer | ISupplier>
          showSearch
          allowClear
          placeholder={entityType === "supplier" ? "Supplier" : "Customer"}
          initialOptions={entityType === "supplier" ? supplierInitial : customerInitial}
          option={({ item }) => ({
            key: item.id,
            value: item.id,
            label: entityType === "supplier" ? supplierLabel(item as ISupplier) : customerLabel(item as ICustomer),
          })}
          onChangeSearchTerm={setEntitySearchTerm}
          query={entityType === "supplier" ? suppliersQuery : customersQuery}
        />
      </Form.Item>

      <Form.Item name="amount" label="Amount" rules={[{ required: true, message: "Please enter amount" }]}>
        <InputNumber style={{ width: "100%" }} placeholder="Enter amount" min={0} precision={2} />
      </Form.Item>

      <Form.Item name="paymentMethod" label="Payment Method" rules={[{ required: true, message: "Please select payment method" }]}>
        <Select placeholder="Select payment method">
          {PAYMENT_METHODS.map((method) => (
            <Select.Option key={method} value={method}>{method}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true, message: "Please select payment date" }]}>
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="referenceType" label="Reference Type">
        <Select placeholder="Select reference type" allowClear onChange={() => form.setFieldValue("referenceId", undefined)}>
          <Select.Option value="sale">Sale</Select.Option>
          <Select.Option value="purchase">Purchase</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="referenceId" label={referenceType === "purchase" ? "Purchase" : "Sale"}>
        <InfiniteScrollSelect<ISale | IPurchase>
          showSearch
          allowClear
          placeholder={referenceType === "purchase" ? "Purchase" : "Sale"}
          initialOptions={referenceType === "purchase" ? purchaseInitial : saleInitial}
          option={({ item }) => ({
            key: item.id,
            value: item.id,
            label: referenceType === "purchase" ? purchaseLabel(item as IPurchase) : saleLabel(item as ISale),
          })}
          onChangeSearchTerm={setReferenceSearchTerm}
          query={referenceType === "purchase" ? purchasesQuery : salesQuery}
        />
      </Form.Item>

      <Form.Item name="note" label="Note"><Input.TextArea rows={3} placeholder="Enter note" /></Form.Item>

      <Form.Item className="text-right !mb-0">
        <Button loading={isLoading} type="primary" htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  );
};

export default PaymentsForm;
