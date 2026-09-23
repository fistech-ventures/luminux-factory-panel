import FloatInput from "@base/antd/components/FloatInput";
import InfiniteScrollSelect from "@base/components/InfiniteScrollSelect";
import { Toolbox } from "@lib/utils";
import { ENUM_PAYMENT_METHODS } from "@lib/constant";
import { ProductsHooks } from "@modules/products/lib/hooks";
import { IProduct } from "@modules/products/lib/interfaces";
import { SuppliersHooks } from "@modules/suppliers/lib/hooks";
import { ISupplier } from "@modules/suppliers/lib/interfaces";
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
  Radio,
  Row,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { IPurchaseCreate } from "../lib/interfaces";

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: any;
  onFinish: (values: IPurchaseCreate) => void;
  backendError?: string | null;
  _onSuccess?: () => void;
}

const PurchasesForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = "create",
  initialValues,
  onFinish,
  backendError,
  _onSuccess,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [supplierSearchTerm, setSupplierSearchTerm] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState(null);
  const hasInitializedValues = useRef(false);
  const initializedRecordId = useRef(initialValues?.id);
  const watchedItems = Form.useWatch("items", form) || [];
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierModalForm] = Form.useForm();
  const supplierCreateFn = SuppliersHooks.useCreate();

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

  const handleFinish = (values: any) => {
    const submittedValues = {
      ...values,
      purchaseDate: dayjs(values.purchaseDate).format("YYYY-MM-DD"),
      items: (values?.items ?? []).map((item) =>
        Toolbox.pickProps(item, [
          "productId",
          "variantId",
                    "skuId",
          "productName",
          "productCode",
          "quantity",
          "totalProductCost",
          "otherCost",
        ]),
      ),
    };
    onFinish(
      formType === "update"
        ? Toolbox.pickTouchedFields(form, submittedValues)
        : submittedValues,
    );
  };

  useEffect(() => {
    // Only reset form when initialValues change and there's no backend error
    const recordChanged = initializedRecordId.current !== initialValues?.id;

    if (
      initialValues &&
      !backendError &&
      (!hasInitializedValues.current || recordChanged)
    ) {
      form.setFieldsValue({
        ...initialValues,
        purchaseDate: initialValues?.purchaseDate
          ? dayjs(initialValues.purchaseDate)
          : dayjs(),
        items: Toolbox.isNotEmpty(initialValues?.items)
          ? initialValues.items.map((item) => ({
              ...item,
              mode: item?.productId ? "existing" : "new",
            }))
          : [],
      });
      hasInitializedValues.current = true;
      initializedRecordId.current = initialValues?.id;
    }
  }, [initialValues, form, backendError]);

  const suppliersQuery = SuppliersHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: supplierSearchTerm,
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

  const purchaserQuery = UsersHooks.useFindById({
    id: initialValues?.purchasedById,
    config: {
      queryKey: [],
      enabled: !!initialValues?.purchasedById,
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

  const findProductSkus = (productId: string) =>
    loadedProducts.find((item: IProduct) => item.id === productId)?.skus ?? [];

  const handleItemModeChangeFn = (idx: number, mode: "existing" | "new") => {
    const currentItems = form.getFieldValue("items") || [];
    const updated = [...currentItems];

    updated[idx] =
      mode === "existing"
        ? { ...updated[idx], productName: null, productCode: null }
        : { ...updated[idx], productId: null, variantId: null, skuId: null };

    form.setFieldsValue({ items: updated });
  };

  const totalPurchaseAmount = watchedItems?.reduce(
    (sum: number, item: any) =>
      sum +
      (Number(item?.totalProductCost) || 0) +
      (Number(item?.otherCost) || 0),
    0,
  );

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
          purchaseDate: initialValues?.purchaseDate
            ? dayjs(initialValues.purchaseDate)
            : dayjs(),
          paymentMethod: initialValues?.paymentMethod || "cash",
          items: Toolbox.isNotEmpty(initialValues?.items)
            ? initialValues.items.map((item) => ({
                ...item,
                mode: item?.productId ? "existing" : "new",
              }))
            : [],
        }}
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: "${label} is required!",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="purchaseDate"
              rules={[
                { required: true, message: "Purchase date is required!" },
              ]}
              className="mb-0!"
            >
              <DatePicker className="w-full" placeholder="Purchase Date" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="purchaseType"
              rules={[
                { required: true, message: "Purchase type is required!" },
              ]}
              className="mb-0!"
            >
              <FloatInput placeholder="Purchase Type (e.g. Bangladesh, China)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="supplierId"
              rules={[{ required: true, message: "Supplier is required!" }]}
              className="mb-0!"
            >
              <InfiniteScrollSelect<ISupplier>
                showSearch
                allowClear
                virtual={false}
                placeholder="Supplier"
                initialOptions={
                  initialValues?.supplier
                    ? [initialValues.supplier as ISupplier]
                    : []
                }
                option={({ item: supplier }) => ({
                  key: supplier?.id,
                  label: `${supplier?.companyName} (${supplier?.contactNumber})`,
                  value: supplier?.id,
                })}
                onChangeSearchTerm={(searchTerm) =>
                  setSupplierSearchTerm(searchTerm)
                }
                query={suppliersQuery}
                renderFooter={(searchTerm) => {
                  const supplierExists = suppliersQuery.data?.pages?.some(page =>
                    page?.data?.some((supplier: ISupplier) =>
                      supplier?.companyName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
                      supplier?.contactNumber?.includes(searchTerm)
                    )
                  );
                  
                  if (!supplierExists && searchTerm && searchTerm.length > 2) {
                    return (
                      <Button
                        type="dashed"
                        block
                        icon={<AiOutlinePlus />}
                        onClick={() => {
                          setIsSupplierModalOpen(true);
                          supplierModalForm.setFieldsValue({ companyName: searchTerm });
                        }}
                      >
                        Create Supplier: {searchTerm}
                      </Button>
                    );
                  }
                  return null;
                }}
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
                    const isExisting = currentRow?.mode !== "new";
                    const variantOptions = isExisting
                      ? findProductVariantOptions(currentRow?.productId)
                      : [];
                    const skus = isExisting ? findProductSkus(currentRow?.productId) : [];

                    return (
                      <div
                        key={field.key}
                        className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Form.Item
                            {...field}
                            name={[field.name, "mode"]}
                            className="mb-0!"
                            initialValue="existing"
                          >
                            <Radio.Group
                              size="small"
                              buttonStyle="solid"
                              onChange={(e) =>
                                handleItemModeChangeFn(idx, e.target.value)
                              }
                            >
                              <Radio.Button value="existing">
                                Existing Product
                              </Radio.Button>
                              <Radio.Button value="new">
                                New Product
                              </Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                          <Button
                            type="text"
                            danger
                            icon={<MdOutlineDeleteOutline />}
                            onClick={() => remove(field.name)}
                          />
                        </div>
                        {isExisting ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Form.Item
                              {...field}
                              name={[field.name, "productId"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Product is required!",
                                },
                              ]}
                              className="mb-0!"
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
                                  items[idx] = { ...items[idx], productId, variantId: null, skuId: null };
                                  form.setFieldsValue({ items });
                                }}
                                onChangeSearchTerm={(searchTerm) =>
                                  setProductSearchTerm(searchTerm)
                                }
                                query={productsQuery}
                              />
                            </Form.Item>
                            {skus.length === 0 && (
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
                            {skus.length > 0 && (
                              <Form.Item
                                {...field}
                                name={[field.name, "skuId"]}
                                rules={[{
                                  required: true,
                                  message: "Combination is required!",
                                }]}
                                className="mb-0!"
                              >
                                <Select
                                  showSearch
                                  placeholder="Sellable combination"
                                  options={skus.map((sku) => ({
                                    value: sku.id,
                                    label: `${sku.productCode} - ${(sku.values ?? [])
                                      .map((value) => value.variantOption?.title)
                                      .join(" / ")}`,
                                  }))}
                                  onChange={() => {
                                    form.setFieldValue(["items", idx, "variantId"], null);
                                  }}
                                />
                              </Form.Item>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Form.Item
                              {...field}
                              name={[field.name, "productName"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Product name is required!",
                                },
                              ]}
                              className="mb-0!"
                            >
                              <FloatInput placeholder="New Product Name" />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, "productCode"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Product code is required!",
                                },
                              ]}
                              className="mb-0!"
                            >
                              <FloatInput placeholder="New Product Code" />
                            </Form.Item>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <Form.Item
                            {...field}
                            name={[field.name, "quantity"]}
                            rules={[
                              {
                                required: true,
                                message: "Quantity is required!",
                              },
                            ]}
                            className="mb-0! w-full!"
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
                            name={[field.name, "totalProductCost"]}
                            rules={[
                              {
                                required: true,
                                message: "Total cost is required!",
                              },
                            ]}
                            className="mb-0! w-full!"
                          >
                            <InputNumber
                              className="w-full!"
                              placeholder="Total Product Cost"
                              min={0}
                              precision={2}
                            />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "otherCost"]}
                            className="mb-0! w-full!"
                          >
                            <InputNumber
                              className="w-full!"
                              placeholder="Other Cost"
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
                    onClick={() => add({ mode: "existing" })}
                  >
                    Add Item
                  </Button>
                </div>
              )}
            </Form.List>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="paidAmount"
              rules={[{ required: true, message: "Paid amount is required!" }]}
              className="mb-0!"
            >
              <InputNumber
                className="w-full!"
                placeholder="Paid Amount"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              name="paymentMethod"
              className="!mb-0"
              rules={[
                { required: true, message: "Payment method is required!" },
              ]}
            >
              <Select
                placeholder="Payment Method"
                options={ENUM_PAYMENT_METHODS.map((method) => ({
                  value: method,
                  label: method,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="purchasedById"
              rules={[{ required: true, message: "Purchased by is required!" }]}
              className="mb-0!"
            >
              <InfiniteScrollSelect<IUser>
                showSearch
                allowClear
                virtual={false}
                placeholder="Purchased By"
                initialOptions={
                  purchaserQuery.data?.data ? [purchaserQuery.data.data] : []
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
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
              <span>Total Purchase Amount</span>
              <span className="font-semibold">
                {Number(totalPurchaseAmount || 0).toFixed(2)}
              </span>
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
        title="Create New Supplier"
        open={isSupplierModalOpen}
        onCancel={() => {
          setIsSupplierModalOpen(false);
          supplierModalForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsSupplierModalOpen(false);
            supplierModalForm.resetFields();
          }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={supplierCreateFn.isPending}
            onClick={() => {
              supplierModalForm.validateFields().then((values) => {
                supplierCreateFn.mutate(values, {
                  onSuccess: (res) => {
                    if (res.success) {
                      messageApi.success('Supplier created successfully');
                      setIsSupplierModalOpen(false);
                      supplierModalForm.resetFields();
                      form.setFieldsValue({ supplierId: res.data.id });
                      // Refresh supplier list
                      suppliersQuery.refetch();
                    } else {
                      messageApi.error(res.message);
                    }
                  },
                });
              });
            }}
          >
            Create Supplier
          </Button>,
        ]}
      >
        <Form
          form={supplierModalForm}
          layout="vertical"
        >
          <Form.Item
            name="companyName"
            rules={[{ required: true, message: 'Company name is required!' }]}
          >
            <Input placeholder="Company Name" />
          </Form.Item>
          <Form.Item
            name="contactNumber"
            rules={[{ required: true, message: 'Contact number is required!' }]}
          >
            <Input placeholder="Contact Number" />
          </Form.Item>
          <Form.Item name="contactPerson">
            <Input placeholder="Contact Person (optional)" />
          </Form.Item>
          <Form.Item name="email">
            <Input placeholder="Email (optional)" />
          </Form.Item>
          <Form.Item name="address">
            <Input placeholder="Address (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default PurchasesForm;
