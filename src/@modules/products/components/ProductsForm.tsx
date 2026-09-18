import FloatInput from "@base/antd/components/FloatInput";
import CustomUploader from "@base/components/CustomUploader";
import { Toolbox } from "@lib/utils";
import { VariantsHooks } from "@modules/variants/lib/hooks";
import { IVariant } from "@modules/variants/lib/interfaces";
import {
  Button,
  Col,
  Divider,
  Form,
  FormInstance,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import React, { useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { IProductCreate } from "../lib/interfaces";

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: Partial<IProductCreate>;
  onFinish: (values: IProductCreate) => void;
  backendError?: string | null;
}

const ProductsForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = "create",
  initialValues,
  onFinish,
  backendError,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const watchedVariants = Form.useWatch("variants", form) || [];

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

  const variantsQuery = VariantsHooks.useFind({
    options: {
      page: 1,
      limit: 300,
    },
  });

  const allVariants: IVariant[] = variantsQuery.data?.data ?? [];

  const findVariantOptions = (variantId: string) => {
    const variant = allVariants.find((item) => item.id === variantId);
    return variant?.options ?? [];
  };

  const handleVariantChangeFn = (idx: number) => {
    // Reset the variant option when the variant changes
    const currentVariants = form.getFieldValue("variants") || [];
    const updated = [...currentVariants];
    updated[idx] = { ...updated[idx], variantOptionId: null };
    form.setFieldsValue({ variants: updated });
  };

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
          variants: Toolbox.isNotEmpty(initialValues?.variants)
            ? initialValues.variants
            : [],
        }}
        onFinish={onFinish}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: "${label} is required!",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="title"
              rules={[{ required: true, message: "Title is required!" }]}
              className="!mb-0"
            >
              <FloatInput placeholder="Title" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="productCode"
              rules={[{ required: true, message: "Product code is required!" }]}
              className="!mb-0"
            >
              <FloatInput placeholder="Product Code (manual, unique)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="description" className="!mb-0">
              <FloatInput placeholder="Description" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="thumbnail" className="!mb-0">
              <CustomUploader
                maxCount={1}
                listType="picture-card"
                acceptedTypes={["jpg", "jpeg", "png", "webp", "avif"]}
                initialValues={
                  Toolbox.isNotEmpty(initialValues?.thumbnail)
                    ? [initialValues.thumbnail]
                    : []
                }
                onChange={(urls) => form.setFieldValue("thumbnail", urls?.[0])}
              />
            </Form.Item>
          </Col>
          <Col xs={8}>
            <Form.Item name="sourcingPrice" className="!mb-0">
              <InputNumber
                className="w-full!"
                placeholder="Sourcing Price"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          <Col xs={8}>
            <Form.Item name="sellingPrice" className="!mb-0">
              <InputNumber
                className="w-full!"
                placeholder="Selling Price"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          <Col xs={8}>
            <Form.Item name="stock" className="mb-0!">
              <InputNumber
                className="w-full!"
                placeholder="Stock"
                min={0}
                precision={0}
                disabled={watchedVariants?.length > 0}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Divider orientation="left" plain>
              Variants
            </Divider>
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <div className="flex flex-col gap-2">
                  {fields.map((field, idx) => {
                    const currentVariants = watchedVariants ?? [];
                    const currentRow = currentVariants[idx] ?? {};

                    return (
                      <div
                        key={field.key}
                        className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Form.Item
                            {...field}
                            name={[field.name, "variantId"]}
                            rules={[
                              {
                                required: true,
                                message: "Variant is required!",
                              },
                            ]}
                            className="!mb-0 flex-1"
                          >
                            <Select
                              showSearch
                              placeholder="Variant"
                              options={allVariants.map((variant) => ({
                                key: variant?.id,
                                label: variant?.title,
                                value: variant?.id,
                              }))}
                              filterOption={(input, option) =>
                                String(option?.label ?? "")
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              onChange={() => handleVariantChangeFn(idx)}
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
                          name={[field.name, "variantOptionId"]}
                          rules={[
                            {
                              required: true,
                              message: "Variant option is required!",
                            },
                          ]}
                          className="!mb-0"
                        >
                          <Select
                            showSearch
                            placeholder="Variant Option"
                            options={Toolbox.toCleanArray(
                              findVariantOptions(currentRow?.variantId)?.map(
                                (option) => ({
                                  key: option?.id,
                                  label: option?.title,
                                  value: option?.id,
                                }),
                              ),
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
                            name={[field.name, "sku"]}
                            className="!mb-0 w-full!"
                          >
                            <FloatInput placeholder="SKU" />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "position"]}
                            className="!mb-0 w-full!"
                          >
                            <InputNumber
                              className="w-full!"
                              placeholder="Position"
                              min={0}
                              precision={0}
                            />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "sellingPrice"]}
                            className="!mb-0 w-full!"
                          >
                            <InputNumber
                              className="w-full!"
                              placeholder="Selling Price"
                              min={0}
                              precision={2}
                            />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "stockQuantity"]}
                            className="!mb-0 w-full!"
                          >
                            <InputNumber
                              className="w-full!"
                              placeholder="Stock Quantity"
                              min={0}
                              precision={0}
                            />
                          </Form.Item>
                        </div>
                        {formType === "update" && (
                          <Form.Item
                            {...field}
                            name={[field.name, "id"]}
                            className="!mb-0 hidden"
                          >
                            <FloatInput />
                          </Form.Item>
                        )}
                      </div>
                    );
                  })}
                  <Button
                    block
                    type="dashed"
                    icon={<AiOutlinePlus />}
                    onClick={() => add({})}
                  >
                    Add Variant
                  </Button>
                </div>
              )}
            </Form.List>
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

export default ProductsForm;
