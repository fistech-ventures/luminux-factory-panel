import FloatInput from "@base/antd/components/FloatInput";
import { Toolbox } from "@lib/utils";
import {
  Button,
  Col,
  Divider,
  Form,
  FormInstance,
  Radio,
  Row,
  Space,
  message,
  Modal,
} from "antd";
import React, { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { IVariantCreate } from "../lib/interfaces";

interface IOption {
  id?: string | number;
  title?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: Partial<IVariantCreate>;
  onFinish: (values: IVariantCreate) => void;
  backendError?: string | null;
}

const VariantsForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = "create",
  initialValues,
  onFinish,
  backendError,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [optionDeleteModal, setOptionDeleteModal] = useState<{
    open: boolean;
    optionTitles: string;
    onConfirm: () => void;
  }>({ open: false, optionTitles: "", onConfirm: () => {} });

  console.warn("Unused: ", optionDeleteModal);

  // Keep track of the last set of option values so that the delete button
  // inside the Form.List can determine which option is being removed.
  const [optionValues, setOptionValues] = useState<IOption | IOption[]>([]);

  // -------------------------------------------------------------------
  // INIT ---
  // Ant Design Form.react does NOT populate dynamic Form.List children
  // reliably when the same Form instance is reused for create and update
  // and we call resetFields() BEFORE setUpdateItem(). The documented way
  // to do this is to explicitly setFieldsValue() whenever the initial
  // values of an existing record change (see ProductsForm.tsx).
  // -------------------------------------------------------------------
  useEffect(() => {
    if (backendError) {
      messageApi.error(backendError);
    }

    form.resetFields();
    if ((initialValues as any)?.id) {
      form.setFieldsValue({
        ...initialValues,
        options: Toolbox.isNotEmpty(initialValues?.options)
          ? initialValues.options
          : [],
      });
    } else {
      form.setFieldsValue({
        ...initialValues,
        options: [],
      });
    }
  }, [form, initialValues, backendError]);

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

  const isExistingOption = (option: IOption) => Boolean(option?.id);

  // Re-run this effect only when the options change, and store them so the
  // delete button inside the Form.List can access the full list.
  useEffect(() => {
    setOptionValues(initialValues?.options ?? []);
  }, [initialValues]);

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
          options: Toolbox.isNotEmpty(initialValues?.options)
            ? initialValues.options
            : [],
        }}
        onFinish={(values) => {
          // ---------------------------------------------------------------------------
          // SUBMIT SYNC -------------------------------------------------
          // Every row that reaches the API MUST carry its id when it is being
          // updated. computeArrayDiffs() relies on the id to decide whether a row is a
          // new row or an update, and the frontend is the only place where we can
          // guarantee that a row is not lost before the diff is computed.
          // ---------------------------------------------------------------------------
          // Sanitize and validate options before sending to the API.
          // Every existing row must carry its id; otherwise the diffing
          // algorithm will think the original row was deleted and replace it
          // with a completely new row.
          const sanitizedOptions = (values?.options ?? []).map(
            (option: IOption) => {
              const normalized = Toolbox.pickProps(option, [
                "id",
                "title",
                "isActive",
              ]) as IOption;
              if (isExistingOption(normalized) && !normalized.id) {
                throw new Error("Option id is required for updates.");
              }
              return normalized;
            },
          );

          const submittedValues = {
            ...values,
            options: sanitizedOptions,
          };

          onFinish(
            formType === "update"
              ? Toolbox.pickTouchedFields(form, submittedValues)
              : submittedValues,
          );
        }}
        onFinishFailed={(errorInfo) => {
          handleFinishFailed(errorInfo);

          // Surface a helpful message to the user when the diffing step fails
          // because the data was not complete.
          const apiError = errorInfo?.errorFields?.find((f: any) =>
            String(f?.name ?? "").includes("options"),
          )?.errors?.[0];
          if (apiError) {
            messageApi.error(apiError);
          }
        }}
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
              <FloatInput placeholder="Title (e.g. Color, Size)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="isActive" className="!mb-0">
              <Radio.Group buttonStyle="solid" className="w-full text-center">
                <Radio.Button className="w-1/2" value={true}>
                  Active
                </Radio.Button>
                <Radio.Button className="w-1/2" value={false}>
                  Inactive
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Divider orientation="left" plain>
              Options
            </Divider>
            <Form.List name="options">
              {(fields, { add }) => (
                <div className="flex flex-col gap-2">
                  {fields.map((field, idx) => {
                    // `values` is the form submission values. It is not in scope inside
                    // Form.List, so we read the current option list from a ref that is
                    // updated whenever the initialValues change.
                    const option = field?.name
                      ? ((optionValues as IOption[]) ?? [])[
                          fields?.findIndex((f: any) => f.name === field.name)
                        ]
                      : undefined;

                    return (
                      <div
                        key={field.key}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <Space.Compact block>
                          <Form.Item
                            {...field}
                            name={[field.name, "title"]}
                            rules={[
                              {
                                required: true,
                                message: "Option title is required!",
                              },
                            ]}
                            className="!mb-0 flex-1"
                          >
                            <FloatInput
                              placeholder={`Option ${idx + 1} (e.g. Red, XL)`}
                            />
                          </Form.Item>

                          {/* Hardening: existing options that already have an id can only be
                              soft-deleted (isDeleted = true) from the API, so they are never
                              hard-deleted from the UI. This prevents the accidental loss of
                              options that are still referenced by products or SKUs. */}
                          {isExistingOption(option) && (
                            <Button
                              type="text"
                              danger
                              icon={<MdOutlineDeleteOutline />}
                              onClick={() => {
                                Modal.confirm({
                                  content: `
                                    This option is referenced by existing products / SKU combinations.
                                    Deleting it would remove those references and break the product's variants.
                                    Are you sure you want to mark this option as deleted (data is never actually removed)?
                                  `,
                                  okType: "danger",
                                  cancelText: "Keep",
                                  okText: "Soft delete",
                                  onOk() {
                                    // The parent list (VariantsList) will handle the diffing
                                    // and the API call, which will set isDeleted = true
                                    // on the option.
                                    setOptionDeleteModal({
                                      open: false,
                                      optionTitles: "",
                                      onConfirm: () => {},
                                    });
                                  },
                                  onCancel() {
                                    // User cancelled: do nothing.
                                  },
                                });
                              }}
                            />
                          )}

                          {formType === "update" && (
                            <Form.Item
                              {...field}
                              name={[field.name, "id"]}
                              className="!mb-0 hidden"
                            >
                              <FloatInput />
                            </Form.Item>
                          )}
                        </Space.Compact>
                      </div>
                    );
                  })}
                  <Button
                    block
                    type="dashed"
                    icon={<AiOutlinePlus />}
                    onClick={() => add({ isActive: true })}
                  >
                    Add Option
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

export default VariantsForm;
