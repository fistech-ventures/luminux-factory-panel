import InfiniteScrollSelect from "@base/components/InfiniteScrollSelect";
import { Toolbox } from "@lib/utils";
import { CustomersHooks } from "@modules/customers/lib/hooks";
import { ICustomer } from "@modules/customers/lib/interfaces";
import { ProductsHooks } from "@modules/products/lib/hooks";
import { IProduct } from "@modules/products/lib/interfaces";
import { UsersHooks } from "@modules/users/lib/hooks";
import { IUser } from "@modules/users/lib/interfaces";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { ISaleCreate } from "../lib/interfaces";

const PAYMENT_METHODS = [
  "Cash",
  "bKash",
  "Nagad",
  "Card",
  "Bank Transfer",
  "Other",
];

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: any;
  onFinish: (values: ISaleCreate) => void;
  backendError?: string | null;
}

const SalesForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = "create",
  initialValues,
  onFinish,
  backendError,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [customerSearchTerm, setCustomerSearchTerm] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState(null);
  const watchedItems = Form.useWatch("items", form) || [];

  useEffect(() => {
    if (backendError) {
      messageApi.error(backendError);
    }
  }, [backendError, messageApi]);

  const handleFinishFailed = (errorInfo: any) => {
    const { errorFields } = errorInfo;
    if (errorFields && errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const errorMessage = firstErrorField.errors[0];

      messageApi.warning(`${errorMessage}`);

      form.scrollToField(firstErrorField.name, {
        behavior: "smooth",
        block: "center",
      });
    }
  };

  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  const customersQuery = CustomersHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: customerSearchTerm,
    },
  });

  const productsQuery = ProductsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: productSearchTerm,
    },
  });

  const usersQuery = UsersHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: userSearchTerm,
    },
  });

  const soldByQuery = UsersHooks.useFindById({
    id: initialValues?.soldById,
    config: {
      queryKey: [],
      enabled: !!initialValues?.soldById,
    },
  });

  const loadedProducts =
    productsQuery.data?.pages?.flatMap((page) => page?.data ?? []) ?? [];

  const findProductVariantOptions = (productId: string) => {
    const product = loadedProducts.find(
      (item: IProduct) => item.id === productId,
    );
    return product?.variants ?? [];
  };

  const totalAmount = watchedItems?.reduce(
    (sum: number, item: any) =>
      sum + (Number(item?.quantity) || 0) * (Number(item?.sellingPrice) || 0),
    0,
  );
  const discount = watchedItems && form ? form.getFieldValue("discount") : 0;
  const grandTotal = (totalAmount || 0) - (Number(discount) || 0);

  return (
    <React.Fragment>
      {messageHolder}
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={{
          ...initialValues,
          date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
          items: Toolbox.isNotEmpty(initialValues?.items)
            ? initialValues.items.map((item) => ({ ...item }))
            : [],
        }}
        onFinish={(values) =>
          onFinish({
            ...values,
            date: dayjs(values.date).format("YYYY-MM-DD"),
            discount: Number(values.discount) || 0,
            paidAmount: Number(values.paidAmount) || 0,
          })
        }
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: "${label} is required!",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="date"
              rules={[{ required: true, message: "Date is required!" }]}
              className="!mb-0"
            >
              <DatePicker className="w-full" placeholder="Date" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="paymentMethod"
              rules={[
                { required: true, message: "Payment method is required!" },
              ]}
              className="!mb-0"
            >
              <Select
                showSearch
                placeholder="Payment Method"
                options={PAYMENT_METHODS.map((method) => ({
                  key: method,
                  label: method,
                  value: method,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="customerId"
              rules={[{ required: true, message: "Customer is required!" }]}
              className="!mb-0"
            >
              <InfiniteScrollSelect<ICustomer>
                showSearch
                allowClear
                virtual={false}
                placeholder="Customer"
                initialOptions={
                  initialValues?.customer
                    ? [initialValues.customer as ICustomer]
                    : []
                }
                option={({ item: customer }) => ({
                  key: customer?.id,
                  label: customer?.name,
                  value: customer?.id,
                })}
                onChangeSearchTerm={(searchTerm) =>
                  setCustomerSearchTerm(searchTerm)
                }
                query={customersQuery}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="soldById"
              rules={[{ required: true, message: "Sold by is required!" }]}
              className="!mb-0"
            >
              <InfiniteScrollSelect<IUser>
                showSearch
                allowClear
                virtual={false}
                placeholder="Sold By"
                initialOptions={
                  soldByQuery.data?.data ? [soldByQuery.data.data] : []
                }
                option={({ item: user }) => ({
                  key: user?.id,
                  label: user?.fullName || user?.email,
                  value: user?.id,
                })}
                onChangeSearchTerm={(searchTerm) =>
                  setUserSearchTerm(searchTerm)
                }
                query={usersQuery}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Divider orientation="left" plain>
              Items
            </Divider>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div className="flex flex-col gap-2">
                  {fields.map((field, idx) => {
                    const currentItems = watchedItems ?? [];
                    const currentRow = currentItems[idx] ?? {};
                    const variantOptions = findProductVariantOptions(
                      currentRow?.productId,
                    );

                    return (
                      <div
                        key={field.key}
                        className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Form.Item
                            {...field}
                            name={[field.name, "productId"]}
                            rules={[
                              {
                                required: true,
                                message: "Product is required!",
                              },
                            ]}
                            className="!mb-0 flex-1"
                          >
                            <InfiniteScrollSelect<IProduct>
                              showSearch
                              allowClear
                              virtual={false}
                              placeholder="Product"
                              option={({ item: product }) => ({
                                key: product?.id,
                                label: `${product?.title} (${product?.productCode})`,
                                value: product?.id,
                              })}
                              onChangeSearchTerm={(searchTerm) =>
                                setProductSearchTerm(searchTerm)
                              }
                              query={productsQuery}
                            />
                          </Form.Item>
                          <Button
                            type="text"
                            danger
                            icon={<MdOutlineDeleteOutline />}
                            onClick={() => remove(field.name)}
                          />
                        </div>
                        <Form.Item
                          {...field}
                          name={[field.name, "variantId"]}
                          className="!mb-0"
                        >
                          <Select
                            showSearch
                            allowClear
                            placeholder="Variant (optional)"
                            options={Toolbox.toCleanArray(
                              variantOptions.map((variant) => ({
                                key: variant?.id,
                                label: `${variant?.variant?.title}: ${variant?.variantOption?.title}`,
                                value: variant?.id,
                              })),
                            )}
                            filterOption={(input, option) =>
                              String(option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-2">
                          <Form.Item
                            {...field}
                            name={[field.name, "quantity"]}
                            rules={[
                              {
                                required: true,
                                message: "Quantity is required!",
                              },
                            ]}
                            className="!mb-0"
                          >
                            <InputNumber
                              className="w-full!"
                              placeholder="Quantity"
                              min={1}
                              precision={0}
                            />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "sellingPrice"]}
                            rules={[
                              {
                                required: true,
                                message: "Selling price is required!",
                              },
                            ]}
                            className="!mb-0"
                          >
                            <InputNumber
                              className="w-full!"
                              placeholder="Selling Price (unit)"
                              min={0}
                              precision={2}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    block
                    type="dashed"
                    icon={<AiOutlinePlus />}
                    onClick={() => add({})}
                  >
                    Add Item
                  </Button>
                </div>
              )}
            </Form.List>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="discount" className="!mb-0">
              <InputNumber
                className="w-full!"
                placeholder="Discount"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="paidAmount"
              rules={[{ required: true, message: "Paid amount is required!" }]}
              className="!mb-0 w-full!"
            >
              <InputNumber
                className="w-full!"
                placeholder="Paid Amount"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <div className="flex flex-col gap-1 border-t border-gray-200 pt-2 text-sm">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-semibold">
                  {Number(totalAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Grand Total (after discount)</span>
                <span className="font-semibold">
                  {Number(grandTotal || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </Col>
          <Col xs={24}>
            <Form.Item className="text-right !mb-0">
              <Button loading={isLoading} type="primary" htmlType="submit">
                {formType === "create" ? "Submit" : "Update"}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default SalesForm;
