import InfiniteScrollSelect from "@base/components/InfiniteScrollSelect";
import { Toolbox } from "@lib/utils";
import { ENUM_PAYMENT_METHODS } from "@lib/constant";
import { ProductsHooks } from "@modules/products/lib/hooks";
import { IProduct } from "@modules/products/lib/interfaces";
import { SuppliersHooks } from "@modules/suppliers/lib/hooks";
import { ISupplier } from "@modules/suppliers/lib/interfaces";
import { UsersHooks } from "@modules/users/lib/hooks";
import { IUser } from "@modules/users/lib/interfaces";
import { VariantsHooks } from "@modules/variants/lib/hooks";
import { IVariant } from "@modules/variants/lib/interfaces";
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
  Switch,
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
  onFinish: (values: IPurchaseCreate) => Promise<unknown> | unknown;
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

  const handleFinish = async (values: any) => {
    const submittedValues = {
      ...values,
      purchaseDate: dayjs(values.purchaseDate).format("YYYY-MM-DD"),
      items: (values?.items ?? []).map((item) => {
        const combinations = item.combinations ?? [];
        const normalizedItem = combinations.length
          ? {
              ...item,
              quantity: combinations.reduce(
                (sum, combination) => sum + (Number(combination.quantity) || 0),
                0,
              ),
              totalProductCost: combinations.reduce(
                (sum, combination) =>
                  sum + (Number(combination.totalProductCost) || 0),
                0,
              ),
              otherCost: combinations.reduce(
                (sum, combination) => sum + (Number(combination.otherCost) || 0),
                0,
              ),
              combinations: combinations.map(({ selectionKey: _selectionKey, ...combination }) => combination),
            }
          : item;

        return Toolbox.pickProps(normalizedItem, [
          "productId",
          "variantId",
          "skuId",
          "productName",
          "productCode",
          "quantity",
          "unit",
          "totalProductCost",
          "otherCost",
          "variants",
          "skus",
          "combinations",
        ]);
      }),
    };
    try {
      const result = await onFinish(
        formType === "update"
          ? Toolbox.pickTouchedFields(form, submittedValues)
          : submittedValues,
      );
      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        result.success === true
      ) {
        _onSuccess?.();
      }
    } catch {
      return;
    }
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
        isActive: initialValues?.isActive ?? true,
        purchaseDate: initialValues?.purchaseDate
          ? dayjs(initialValues.purchaseDate)
          : dayjs(),
        items: Toolbox.isNotEmpty(initialValues?.items)
          ? initialValues.items.map((item) => ({
              ...item,
              unit: item?.unit ?? item?.product?.unit,
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

  const variantsQuery = VariantsHooks.useFind({
    options: { page: 1, limit: 300 },
  });
  const allVariants: IVariant[] = variantsQuery.data?.data ?? [];
  const findVariantOptions = (variantId: string) =>
    allVariants.find((variant) => variant.id === variantId)?.options ?? [];

  const filterVariantOption = (input: string, option: { value?: string | number }) => {
    const variant = allVariants.find((item) => item.id === option?.value);
    const searchTerm = input.toLowerCase();
    return [
      variant?.title,
      ...(variant?.options ?? []).map((variantOption) => variantOption.title),
    ].some((value) => value?.toLowerCase().includes(searchTerm));
  };

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
        ? {
            ...updated[idx],
            productName: null,
            productCode: null,
            unit: null,
            variants: [],
            skus: [],
            combinations: [],
          }
        : {
            ...updated[idx],
            productId: null,
            variantId: null,
            skuId: null,
            unit: null,
            combinations: [],
          };

    form.setFieldsValue({ items: updated });
  };

  const totalPurchaseAmount = watchedItems?.reduce((sum: number, item: any) => {
    const combinations = item?.combinations ?? [];
    const totalProductCost =
      combinations.length
        ? combinations.reduce(
            (total, combination) =>
              total + (Number(combination?.totalProductCost) || 0),
            0,
          )
        : Number(item?.totalProductCost) || 0;
    const otherCost =
      combinations.length
        ? combinations.reduce(
            (total, combination) =>
              total + (Number(combination?.otherCost) || 0),
            0,
          )
        : Number(item?.otherCost) || 0;

    return sum + totalProductCost + otherCost;
  }, 0);

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
          isActive: initialValues?.isActive ?? true,
          purchaseDate: initialValues?.purchaseDate
            ? dayjs(initialValues.purchaseDate)
            : dayjs(),
          paymentMethod: initialValues?.paymentMethod || "cash",
          items: Toolbox.isNotEmpty(initialValues?.items)
            ? initialValues.items.map((item) => ({
                ...item,
                unit: item?.unit ?? item?.product?.unit,
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
            <Form.Item name="isActive" label="Purchase status" valuePropName="checked" className="mb-0!">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
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
              <Input placeholder="Purchase Type (e.g. Bangladesh, China)" />
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
                  const supplierExists = suppliersQuery.data?.pages?.some(
                    (page) =>
                      page?.data?.some(
                        (supplier: ISupplier) =>
                          supplier?.companyName
                            ?.toLowerCase()
                            .includes(searchTerm?.toLowerCase()) ||
                          supplier?.contactNumber?.includes(searchTerm),
                      ),
                  );

                  if (!supplierExists && searchTerm && searchTerm.length > 2) {
                    return (
                      <Button
                        type="dashed"
                        block
                        icon={<AiOutlinePlus />}
                        onClick={() => {
                          setIsSupplierModalOpen(true);
                          supplierModalForm.setFieldsValue({
                            companyName: searchTerm,
                          });
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
                    const selectedProduct = loadedProducts.find(
                      (product: IProduct) =>
                        product.id === currentRow?.productId,
                    );
                    const variantOptions = isExisting
                      ? findProductVariantOptions(currentRow?.productId)
                      : [];
                    const skus = isExisting
                      ? findProductSkus(currentRow?.productId)
                      : [];
                    const existingCombinationOptions = [
                      ...skus.map((sku) => ({
                        value: `sku:${sku.id}`,
                        label: `${sku.productCode} - ${(sku.values ?? [])
                          .map((value) => `${value.variant?.title ?? ""}: ${value.variantOption?.title ?? ""}`)
                          .join(" / ")}`,
                      })),
                      ...variantOptions.map((variant) => ({
                        value: `variant:${variant.id}`,
                        label: `${variant.variant?.title ?? "Variant"}: ${variant.variantOption?.title ?? "Option"}${variant.sku ? ` (${variant.sku})` : ""}`,
                      })),
                    ];
                    const useExistingCombinationLines =
                      isExisting &&
                      formType === "create" &&
                      existingCombinationOptions.length > 0;
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
                          <>
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
                                  const items = [
                                    ...(form.getFieldValue("items") || []),
                                  ];
                                  const product = loadedProducts.find(
                                    (item: IProduct) => item.id === productId,
                                  );
                                  items[idx] = {
                                    ...items[idx],
                                    productId,
                                    unit: product?.unit ?? null,
                                    variantId: null,
                                    skuId: null,
                                    combinations: [],
                                  };
                                  form.setFieldsValue({ items });
                                }}
                                onChangeSearchTerm={(searchTerm) =>
                                  setProductSearchTerm(searchTerm)
                                }
                                query={productsQuery}
                              />
                            </Form.Item>
                            {!useExistingCombinationLines && skus.length === 0 && (
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
                            {!useExistingCombinationLines && skus.length > 0 && (
                              <Form.Item
                                {...field}
                                name={[field.name, "skuId"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Combination is required!",
                                  },
                                ]}
                                className="mb-0!"
                              >
                                <Select
                                  showSearch
                                  placeholder="Sellable combination"
                                  options={skus.map((sku) => ({
                                    value: sku.id,
                                    label: `${sku.productCode} - ${(
                                      sku.values ?? []
                                    )
                                      .map(
                                        (value) => value.variantOption?.title,
                                      )
                                      .join(" / ")}`,
                                  }))}
                                      filterOption={filterSkuOption}
                                  onChange={() => {
                                    form.setFieldValue(
                                      ["items", idx, "variantId"],
                                      null,
                                    );
                                  }}
                                />
                              </Form.Item>
                            )}
                          </div>
                          {useExistingCombinationLines && (
                            <>
                              <Divider plain>Purchase combinations</Divider>
                              <Form.List
                                name={[field.name, "combinations"]}
                                rules={[
                                  {
                                    validator: async (_, value) => {
                                      if (!value?.length) {
                                        throw new Error("Add at least one combination!");
                                      }
                                    },
                                  },
                                ]}
                              >
                                {(combinationFields, { add, remove }) => (
                                  <div className="flex flex-col gap-2">
                                    {combinationFields.map((combinationField) => (
                                      <div
                                        key={combinationField.key}
                                        className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start"
                                      >
                                        <Form.Item
                                          {...combinationField}
                                          name={[combinationField.name, "selectionKey"]}
                                          rules={[{ required: true, message: "Select a combination!" }]}
                                          className="mb-0!"
                                        >
                                          <Select
                                            showSearch
                                            allowClear
                                            placeholder="SKU / Variant"
                                            options={existingCombinationOptions}
                                            onChange={(selectionKey) => {
                                              const [kind, id] = String(selectionKey ?? "").split(":");
                                              const sku = kind === "sku"
                                                ? skus.find((candidate) => candidate.id === id)
                                                : undefined;
                                              const variant = kind === "variant"
                                                ? variantOptions.find((candidate) => candidate.id === id)
                                                : undefined;
                                              const combinations = [
                                                ...(form.getFieldValue(["items", idx, "combinations"]) ?? []),
                                              ];
                                              combinations[combinationField.name] = {
                                                ...combinations[combinationField.name],
                                                selectionKey,
                                                skuId: sku?.id,
                                                variantId: variant?.id,
                                                productCode: sku?.productCode ?? variant?.sku ?? variant?.variantOption?.title,
                                                name: sku?.name ?? variant?.variantOption?.title,
                                              };
                                              form.setFieldValue(
                                                ["items", idx, "combinations"],
                                                combinations,
                                              );
                                            }}
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          {...combinationField}
                                          name={[combinationField.name, "quantity"]}
                                          rules={[{ required: true, message: "Quantity is required!" }]}
                                          className="mb-0!"
                                        >
                                          <InputNumber className="w-full!" min={1} precision={0} placeholder="Quantity" />
                                        </Form.Item>
                                        <Form.Item
                                          {...combinationField}
                                          name={[combinationField.name, "totalProductCost"]}
                                          rules={[{ required: true, message: "Product cost is required!" }]}
                                          className="mb-0!"
                                        >
                                          <InputNumber className="w-full!" min={0} precision={2} placeholder="Product Cost" />
                                        </Form.Item>
                                        <Form.Item
                                          {...combinationField}
                                          name={[combinationField.name, "otherCost"]}
                                          className="mb-0!"
                                        >
                                          <InputNumber className="w-full!" min={0} precision={2} placeholder="Other Cost" />
                                        </Form.Item>
                                        <Button
                                          type="text"
                                          danger
                                          icon={<MdOutlineDeleteOutline />}
                                          onClick={() => remove(combinationField.name)}
                                        />
                                      </div>
                                    ))}
                                    <Button block type="dashed" onClick={() => add({ otherCost: 0 })}>
                                      Add combination
                                    </Button>
                                  </div>
                                )}
                              </Form.List>
                            </>
                          )}
                          </>
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
                              <Input placeholder="New Product Name" />
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
                              <Input placeholder="New Product Code" />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, "unit"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Unit is required!",
                                },
                              ]}
                              className="mb-0!"
                            >
                              <Input placeholder="Unit" />
                            </Form.Item>
                          </div>
                        )}
                        {isExisting && !useExistingCombinationLines && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                                min={1}
                                precision={0}
                              />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, "unit"]}
                              className="mb-0!"
                            >
                              <Input
                                placeholder="Unit"
                                value={
                                  currentRow?.unit ?? selectedProduct?.unit
                                }
                                readOnly
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
                              className="mb-0!"
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
                              className="mb-0!"
                            >
                              <InputNumber
                                className="w-full!"
                                placeholder="Other Cost"
                                min={0}
                                precision={2}
                              />
                            </Form.Item>
                          </div>
                        )}
                        {!isExisting && (
                          <>
                            <Divider plain>Sellable combinations</Divider>
                            <Form.List name={[field.name, "combinations"]}>
                              {(
                                skuFields,
                                { add: addSku, remove: removeSku },
                              ) => (
                                <div className="flex flex-col gap-2">
                                  {skuFields.map(
                                    (skuField, combinationIndex) => {
                                      const combination =
                                        currentRow?.combinations?.[
                                          combinationIndex
                                        ] ?? {};
                                      const sourcingPrice =
                                        Number(combination.quantity) > 0
                                          ? (Number(
                                              combination.totalProductCost || 0,
                                            ) +
                                              Number(
                                                combination.otherCost || 0,
                                              )) /
                                            Number(combination.quantity)
                                          : 0;

                                      return (
                                        <div
                                          key={skuField.key}
                                          className="border border-blue-200 rounded-lg p-3 flex flex-col gap-2"
                                        >
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <Form.Item
                                              {...skuField}
                                              name={[
                                                skuField.name,
                                                "productCode",
                                              ]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message:
                                                    "SKU/Combination code is required!",
                                                },
                                              ]}
                                              className="!mb-0"
                                            >
                                              <Input placeholder="SKU/Combination code" />
                                            </Form.Item>
                                            <Form.Item
                                              {...skuField}
                                              name={[skuField.name, "quantity"]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message:
                                                    "Combination quantity is required!",
                                                },
                                              ]}
                                              className="!mb-0"
                                            >
                                              <InputNumber
                                                className="w-full!"
                                                min={1}
                                                precision={0}
                                                placeholder="Quantity"
                                              />
                                            </Form.Item>
                                            <Form.Item
                                              {...skuField}
                                              name={[
                                                skuField.name,
                                                "totalProductCost",
                                              ]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message:
                                                    "Combination cost is required!",
                                                },
                                              ]}
                                              className="!mb-0"
                                            >
                                              <InputNumber
                                                className="w-full!"
                                                min={0}
                                                precision={2}
                                                placeholder="Total Product Cost"
                                              />
                                            </Form.Item>
                                            <Form.Item
                                              {...skuField}
                                              name={[
                                                skuField.name,
                                                "otherCost",
                                              ]}
                                              className="!mb-0"
                                            >
                                              <InputNumber
                                                className="w-full!"
                                                min={0}
                                                precision={2}
                                                placeholder="Other Cost"
                                              />
                                            </Form.Item>
                                            <Input
                                              value={`Sourcing Price: ${sourcingPrice.toFixed(2)}`}
                                              readOnly
                                            />
                                            <Button
                                              type="text"
                                              danger
                                              icon={<MdOutlineDeleteOutline />}
                                              onClick={() =>
                                                removeSku(skuField.name)
                                              }
                                            />
                                          </div>
                                          <Form.List
                                            name={[skuField.name, "values"]}
                                          >
                                            {(
                                              valueFields,
                                              {
                                                add: addValue,
                                                remove: removeValue,
                                              },
                                            ) => (
                                              <div className="flex flex-col gap-2">
                                                {valueFields.map(
                                                  (valueField, valueIndex) => {
                                                    const values =
                                                      combination.values ?? [];
                                                    const value =
                                                      values[valueIndex] ?? {};
                                                    return (
                                                      <div
                                                        key={valueField.key}
                                                        className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                                                      >
                                                        <Form.Item
                                                          {...valueField}
                                                          name={[
                                                            valueField.name,
                                                            "variantId",
                                                          ]}
                                                          rules={[
                                                            { required: true },
                                                          ]}
                                                          className="!mb-0"
                                                        >
                                                          <Select
                                                            showSearch
                                                            placeholder="Attribute"
                                                            options={allVariants.map(
                                                              (variant) => ({
                                                                label:
                                                                  variant.title,
                                                                value:
                                                                  variant.id,
                                                              }),
                                                            )}
                                                            filterOption={filterVariantOption}
                                                            onChange={() => {
                                                              const next = [
                                                                ...(form.getFieldValue(
                                                                  [
                                                                    "items",
                                                                    idx,
                                                                    "combinations",
                                                                    combinationIndex,
                                                                    "values",
                                                                  ],
                                                                ) ?? []),
                                                              ];
                                                              next[valueIndex] =
                                                                {
                                                                  ...next[
                                                                    valueIndex
                                                                  ],
                                                                  variantOptionId:
                                                                    undefined,
                                                                };
                                                              form.setFieldValue(
                                                                [
                                                                  "items",
                                                                  idx,
                                                                  "combinations",
                                                                  combinationIndex,
                                                                  "values",
                                                                ],
                                                                next,
                                                              );
                                                            }}
                                                          />
                                                        </Form.Item>
                                                        <Form.Item
                                                          {...valueField}
                                                          name={[
                                                            valueField.name,
                                                            "variantOptionId",
                                                          ]}
                                                          rules={[
                                                            { required: true },
                                                          ]}
                                                          className="!mb-0"
                                                        >
                                                          <Select
                                                            showSearch
                                                            placeholder="Option"
                                                            options={Toolbox.toCleanArray(
                                                              findVariantOptions(
                                                                value.variantId,
                                                              ).map(
                                                                (option) => ({
                                                                  label:
                                                                    option.title,
                                                                  value:
                                                                    option.id,
                                                                }),
                                                              ),
                                                            )}
                                                          />
                                                        </Form.Item>
                                                        <Button
                                                          type="text"
                                                          danger
                                                          icon={
                                                            <MdOutlineDeleteOutline />
                                                          }
                                                          onClick={() =>
                                                            removeValue(
                                                              valueField.name,
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                    );
                                                  },
                                                )}
                                                <Button
                                                  type="dashed"
                                                  onClick={() => addValue({})}
                                                >
                                                  Add attribute
                                                </Button>
                                              </div>
                                            )}
                                          </Form.List>
                                        </div>
                                      );
                                    },
                                  )}
                                  <Button
                                    block
                                    type="dashed"
                                    onClick={() =>
                                      addSku({ values: [] })
                                    }
                                  >
                                    Add combination
                                  </Button>
                                </div>
                              )}
                            </Form.List>
                            <Divider plain>Legacy variants</Divider>
                            <Form.List name={[field.name, "variants"]}>
                              {(
                                variantFields,
                                { add: addVariant, remove: removeVariant },
                              ) => (
                                <div className="flex flex-col gap-2">
                                  {variantFields.map((variantField) => {
                                    const variants =
                                      form.getFieldValue([
                                        "items",
                                        idx,
                                        "variants",
                                      ]) ?? [];
                                    const variant =
                                      variants[variantField.name] ?? {};
                                    return (
                                      <div
                                        key={variantField.key}
                                        className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center"
                                      >
                                        <Form.Item
                                          {...variantField}
                                          name={[
                                            variantField.name,
                                            "variantId",
                                          ]}
                                          rules={[{ required: true }]}
                                          className="!mb-0"
                                        >
                                          <Select
                                            showSearch
                                            placeholder="Variant"
                                            options={allVariants.map(
                                              (item) => ({
                                                label: item.title,
                                                value: item.id,
                                              }),
                                            )}
                                            filterOption={filterVariantOption}
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          {...variantField}
                                          name={[
                                            variantField.name,
                                            "variantOptionId",
                                          ]}
                                          rules={[{ required: true }]}
                                          className="!mb-0"
                                        >
                                          <Select
                                            showSearch
                                            placeholder="Variant option"
                                            options={Toolbox.toCleanArray(
                                              findVariantOptions(
                                                variant.variantId,
                                              ).map((option) => ({
                                                label: option.title,
                                                value: option.id,
                                              })),
                                            )}
                                            filterOption={(input, option) =>
                                              String(option?.label ?? '')
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                            }
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          {...variantField}
                                          name={[
                                            variantField.name,
                                            "stockQuantity",
                                          ]}
                                          className="!mb-0"
                                        >
                                          <InputNumber
                                            className="w-full!"
                                            min={0}
                                            precision={0}
                                            placeholder="Stock"
                                          />
                                        </Form.Item>
                                        <Button
                                          type="text"
                                          danger
                                          icon={<MdOutlineDeleteOutline />}
                                          onClick={() =>
                                            removeVariant(variantField.name)
                                          }
                                        />
                                      </div>
                                    );
                                  })}
                                  <Button
                                    block
                                    type="dashed"
                                    onClick={() => addVariant({})}
                                  >
                                    Add variant
                                  </Button>
                                </div>
                              )}
                            </Form.List>
                          </>
                        )}
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
          <Button
            key="cancel"
            onClick={() => {
              setIsSupplierModalOpen(false);
              supplierModalForm.resetFields();
            }}
          >
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
                      messageApi.success("Supplier created successfully");
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
        <Form form={supplierModalForm} layout="vertical">
          <Form.Item
            name="companyName"
            rules={[{ required: true, message: "Company name is required!" }]}
          >
            <Input placeholder="Company Name" />
          </Form.Item>
          <Form.Item
            name="contactNumber"
            rules={[{ required: true, message: "Contact number is required!" }]}
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
