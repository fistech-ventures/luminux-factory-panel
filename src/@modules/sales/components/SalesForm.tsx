import InfiniteScrollSelect from "@base/components/InfiniteScrollSelect";
import { Toolbox } from "@lib/utils";
import { ENUM_PAYMENT_METHODS, ENUM_CUSTOMER_TYPES } from "@lib/constant";
import { CustomersHooks } from "@modules/customers/lib/hooks";
import { ICustomer } from "@modules/customers/lib/interfaces";
import { ProductsHooks } from "@modules/products/lib/hooks";
import { IProduct } from "@modules/products/lib/interfaces";
import { RawMaterialsHooks } from "@modules/raw-materials/lib/hooks";
import { IRawMaterial } from "@modules/raw-materials/lib/interfaces";
import { UsersHooks } from "@modules/users/lib/hooks";
import { IUser } from "@modules/users/lib/interfaces";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { ISaleCreate } from "../lib/interfaces";

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
    const [rawMaterialSearchTerm, setRawMaterialSearchTerm] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState(null);
  const hasInitializedValues = useRef(false);
  const initializedRecordId = useRef(initialValues?.id);
  const watchedItems = Form.useWatch("items", form) || [];
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalForm] = Form.useForm();
  const customerCreateFn = CustomersHooks.useCreate();

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
    // Only sync the form when initialValues change and there's no backend error,
    // otherwise a parent re-render (e.g. after creating a customer) would wipe
    // the selection made by the user or by the create modal.
    const recordChanged = initializedRecordId.current !== initialValues?.id;

    if (
      initialValues &&
      !backendError &&
      (!hasInitializedValues.current || recordChanged)
    ) {
      form.setFieldsValue({
        ...initialValues,
        soldById: undefined,
        date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
        paymentMethod: initialValues?.paymentMethod || "cash",
        items: Toolbox.isNotEmpty(initialValues?.items)
          ? initialValues.items.map((item) => ({
              ...item,
              itemType: item.itemType ?? (item.rawMaterialId ? "rawMaterial" : "product"),
            }))
          : [],
      });
      hasInitializedValues.current = true;
      initializedRecordId.current = initialValues?.id;
    }
  }, [initialValues, form, backendError]);

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

  const rawMaterialsQuery = RawMaterialsHooks.useFindInfinite({
    options: { limit: 20, searchTerm: rawMaterialSearchTerm },
  });

  const usersQuery = UsersHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: userSearchTerm,
    },
  });

  const loadedProducts =
    productsQuery.data?.pages?.flatMap((page) => page?.data ?? []) ?? [];
  const loadedRawMaterials =
    rawMaterialsQuery.data?.pages?.flatMap((page) => page?.data ?? []) ?? [];

  const findProductVariantOptions = (productId: string) => {
    const product = loadedProducts.find(
      (item: IProduct) => item.id === productId,
    );
    return product?.variants ?? [];
  };

  const findProductSkus = (productId: string) =>
    loadedProducts.find((item: IProduct) => item.id === productId)?.skus ?? [];

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
          soldById: undefined,
          date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
          paymentMethod: initialValues?.paymentMethod || "cash",
          items: Toolbox.isNotEmpty(initialValues?.items)
            ? initialValues.items.map((item) => ({ ...item }))
            : [],
        }}
        onFinish={(values) => {
          const submittedValues = {
            ...values,
            date: dayjs(values.date).format("YYYY-MM-DD"),
            discount: Number(values.discount) || 0,
            paidAmount: Number(values.paidAmount) || 0,
            items: (values.items ?? []).map((item) => ({
              itemType: item.itemType ?? "product",
              ...(item.itemType === "rawMaterial"
                ? {
                    rawMaterialId: item.rawMaterialId,
                    rawMaterialCombinationId: item.rawMaterialCombinationId,
                  }
                : { productId: item.productId, variantId: item.variantId, skuId: item.skuId }),
              quantity: item.quantity,
              sellingPrice: item.sellingPrice,
            })),
          };
          onFinish(
            formType === "update"
              ? Toolbox.pickTouchedFields(form, submittedValues)
              : submittedValues,
          );
        }}
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
              className="mb-0!"
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
              className="mb-0!"
            >
              <Select
                showSearch
                placeholder="Payment Method"
                options={ENUM_PAYMENT_METHODS.map((method) => ({
                  key: method,
                  label: method,
                  value: method,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="customerId"
              rules={[{ required: true, message: "Customer is required!" }]}
              className="mb-0!"
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
                  label: `${customer?.companyName} (${customer?.name}) - ${customer?.contactNumber}`,
                  value: customer?.id,
                })}
                onChangeSearchTerm={(searchTerm) =>
                  setCustomerSearchTerm(searchTerm)
                }
                query={customersQuery}
                renderFooter={(searchTerm) => {
                  const customerExists = customersQuery.data?.pages?.some(
                    (page) =>
                      page?.data?.some(
                        (customer: ICustomer) =>
                          customer?.name
                            ?.toLowerCase()
                            .includes(searchTerm?.toLowerCase()) ||
                          customer?.contactNumber?.includes(searchTerm),
                      ),
                  );

                  if (!customerExists && searchTerm && searchTerm.length > 2) {
                    return (
                      <Button
                        type="dashed"
                        block
                        icon={<AiOutlinePlus />}
                        onClick={() => {
                          setIsCustomerModalOpen(true);
                          customerModalForm.setFieldsValue({
                            name: searchTerm,
                          });
                        }}
                      >
                        Create Customer: {searchTerm}
                      </Button>
                    );
                  }
                  return null;
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="soldById"
              rules={[{ required: true, message: "Sold by is required!" }]}
              className="mb-0!"
            >
              <InfiniteScrollSelect<IUser>
                showSearch
                allowClear
                virtual={false}
                placeholder="Sold By"
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

          <Col xs={12}>
            <Form.Item
              name="shippingTo"
              rules={[{ required: true, message: "Shipping to is required!" }]}
              className="mb-0!"
            >
              <Input className="w-full" placeholder="Shipping to" />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="shippingAddress"
              rules={[
                { required: true, message: "Shipping address is required!" },
              ]}
              className="mb-0!"
            >
              <Input className="w-full" placeholder="Shipping Address" />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="shippingContact"
              rules={[
                {
                  required: true,
                  message: "Shipping contact number is required!",
                },
              ]}
              className="mb-0!"
            >
              <Input className="w-full" placeholder="Shipping Contact Number" />
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
                    const isRawMaterial = currentRow?.itemType === "rawMaterial";
                    const selectedRawMaterial = loadedRawMaterials.find(
                      (rawMaterial) => rawMaterial.id === currentRow?.rawMaterialId,
                    ) ?? initialValues?.items?.[idx]?.rawMaterial;
                    const rawMaterialCombinations = selectedRawMaterial?.combinations ?? [];
                    const variantOptions = findProductVariantOptions(
                      currentRow?.productId,
                    );
                    const skus = findProductSkus(currentRow?.productId);
                    const filterSkuOption = (
                      input: string,
                      option: { value?: string | number },
                    ) => {
                      const sku = skus.find((item) => item.id === option?.value);
                      const searchTerm = input.toLowerCase();
                      return [
                        sku?.productCode,
                        ...(sku?.values ?? []).flatMap((value) => [
                          value.variant?.title,
                          value.variantOption?.title,
                        ]),
                      ].some((value) =>
                        value?.toLowerCase().includes(searchTerm),
                      );
                    };

                    return (
                      <div
                        key={field.key}
                        className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, "itemType"]}
                          initialValue="product"
                          className="mb-0!"
                        >
                          <Select
                            options={[
                              { label: "Finished product", value: "product" },
                              { label: "Raw material", value: "rawMaterial" },
                            ]}
                            onChange={(itemType) => {
                              const items = [...(form.getFieldValue("items") || [])];
                              items[idx] = {
                                ...items[idx],
                                itemType,
                                productId: null,
                                rawMaterialId: null,
                                rawMaterialCombinationId: null,
                                variantId: null,
                                skuId: null,
                              };
                              form.setFieldsValue({ items });
                            }}
                          />
                        </Form.Item>
                        <div className="flex items-center justify-between gap-2">
                          {isRawMaterial ? (
                            <Form.Item
                              {...field}
                              name={[field.name, "rawMaterialId"]}
                              rules={[{ required: true, message: "Raw material is required!" }]}
                              className="mb-0! flex-1"
                            >
                              <InfiniteScrollSelect<IRawMaterial>
                                showSearch
                                allowClear
                                virtual={false}
                                placeholder="Raw material"
                                initialOptions={initialValues?.items?.[idx]?.rawMaterial ? [initialValues.items[idx].rawMaterial] : []}
                                option={({ item }) => ({
                                  key: item.id,
                                  label: `${item.title} (${item.stock} ${item.unit ?? ''} available)`,
                                  value: item.id,
                                })}
                                onChange={(rawMaterialId) => {
                                  const items = [...(form.getFieldValue("items") || [])];
                                  const rawMaterial = loadedRawMaterials.find((entry) => entry.id === rawMaterialId);
                                  items[idx] = {
                                    ...items[idx],
                                    rawMaterialId,
                                    rawMaterialCombinationId: null,
                                    productId: null,
                                  };
                                  form.setFieldsValue({ items });
                                  if (rawMaterial && !rawMaterial.combinations?.length) {
                                    form.setFieldValue(["items", idx, "sellingPrice"], rawMaterial.sellingPrice);
                                  }
                                }}
                                onChangeSearchTerm={setRawMaterialSearchTerm}
                                query={rawMaterialsQuery}
                              />
                            </Form.Item>
                          ) : (
                            <Form.Item
                              {...field}
                              name={[field.name, "productId"]}
                              rules={[{ required: true, message: "Product is required!" }]}
                              className="mb-0! flex-1"
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
                                onChange={(productId) => {
                                  const items = [...(form.getFieldValue("items") || [])];
                                  items[idx] = { ...items[idx], productId, rawMaterialId: null, variantId: null, skuId: null };
                                  form.setFieldsValue({ items });
                                }}
                                onChangeSearchTerm={setProductSearchTerm}
                                query={productsQuery}
                              />
                            </Form.Item>
                          )}
                          <Button
                            type="text"
                            danger
                            icon={<MdOutlineDeleteOutline />}
                            onClick={() => remove(field.name)}
                          />
                        </div>
                        {isRawMaterial && (
                          <Form.Item
                            {...field}
                            name={[field.name, "rawMaterialCombinationId"]}
                            rules={rawMaterialCombinations.length > 0 ? [{ required: true, message: "Raw-material combination is required!" }] : []}
                            className="mb-0!"
                          >
                            <Select
                              showSearch
                              disabled={rawMaterialCombinations.length === 0}
                              placeholder={rawMaterialCombinations.length ? "Raw-material combination" : "No combinations configured"}
                              options={rawMaterialCombinations.map((combination) => ({
                                value: combination.id,
                                label: `${combination.title}${combination.code ? ` (${combination.code})` : ''} - ${combination.stock} ${combination.unit ?? selectedRawMaterial?.unit ?? ''}`,
                              }))}
                              onChange={(combinationId) => {
                                const combination = rawMaterialCombinations.find((candidate) => candidate.id === combinationId);
                                if (combination) {
                                  form.setFieldValue(["items", idx, "sellingPrice"], combination.sellingPrice);
                                }
                              }}
                            />
                          </Form.Item>
                        )}
                        {!isRawMaterial && skus.length === 0 && (
                          <Form.Item
                            {...field}
                            name={[field.name, "variantId"]}
                            className="mb-0!"
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
                        )}
                        {!isRawMaterial && skus.length > 0 && (
                          <Form.Item {...field} name={[field.name, "skuId"]} rules={[{ required: true, message: "Combination is required!" }]} className="mb-0!">
                            <Select
                              showSearch
                              placeholder="Sellable combination"
                              options={skus.map((sku) => ({ value: sku.id, label: `${sku.productCode} - ${(sku.values ?? []).map((value) => value.variantOption?.title).join(" / ")}` }))}
                              filterOption={filterSkuOption}
                              onChange={(skuId) => {
                                const sku = skus.find((item) => item.id === skuId);
                                if (sku?.sellingPrice == null) return;
                                form.setFieldValue(["items", idx, "sellingPrice"], sku.sellingPrice);
                              }}
                            />
                          </Form.Item>
                        )}
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
                            className="mb-0!"
                          >
                            <InputNumber
                              className="w-full!"
                              placeholder="Quantity"
                              min={isRawMaterial ? 0.001 : 1}
                              precision={isRawMaterial ? 3 : 0}
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
                            className="mb-0!"
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
                    onClick={() => add({ itemType: "product" })}
                  >
                    Add Item
                  </Button>
                </div>
              )}
            </Form.List>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="discount" className="mb-0!">
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
              className="mb-0! w-full!"
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
            <Form.Item className="text-right mb-0!">
              <Button loading={isLoading} type="primary" htmlType="submit">
                {formType === "create" ? "Submit" : "Update"}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Modal
        title="Create New Customer"
        open={isCustomerModalOpen}
        onCancel={() => {
          setIsCustomerModalOpen(false);
          customerModalForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsCustomerModalOpen(false);
              customerModalForm.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={customerCreateFn.isPending}
            onClick={() => {
              customerModalForm.validateFields().then((values) => {
                customerCreateFn.mutate(values, {
                  onSuccess: (res) => {
                    if (res.success) {
                      messageApi.success("Customer created successfully");
                      setIsCustomerModalOpen(false);
                      customerModalForm.resetFields();
                      form.setFieldsValue({ customerId: res.data.id });
                      // Refresh customer list
                      customersQuery.refetch();
                    } else {
                      messageApi.error(res.message);
                    }
                  },
                });
              });
            }}
          >
            Create Customer
          </Button>,
        ]}
      >
        <Form
          form={customerModalForm}
          layout="vertical"
          initialValues={{
            customerType: "B2C",
          }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Customer name is required!" }]}
          >
            <Input placeholder="Customer Name" />
          </Form.Item>
          <Form.Item
            name="contactNumber"
            rules={[{ required: true, message: "Contact number is required!" }]}
          >
            <Input placeholder="Contact Number" />
          </Form.Item>
          <Form.Item
            name="customerType"
            rules={[{ required: true, message: "Customer type is required!" }]}
          >
            <Select
              options={ENUM_CUSTOMER_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
            />
          </Form.Item>
          <Form.Item name="email">
            <Input placeholder="Email (optional)" />
          </Form.Item>
          <Form.Item name="address">
            <Input placeholder="Address (optional)" />
          </Form.Item>
          <Form.Item name="companyName">
            <Input placeholder="Company Name (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default SalesForm;
