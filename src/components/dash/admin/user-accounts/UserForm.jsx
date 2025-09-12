"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";

export default function UserForm({
  open,
  onCancel,
  onSave,
  initialData, // { user:{...}, profile:{...} }
  isEdit,
  roles,
  types,
  companyOptions,   // [{label,value}]
  coverageOptions,  // [{label,value}]
  planTypeOptions,  // [{label,value}]
}) {
  const [form] = Form.useForm();

  const ensureOptionVisible = (options, value) => {
    if (!value) return options;
    const exists = (options || []).some((o) => String(o.value) === String(value));
    return exists ? options : [{ label: String(value), value: String(value) }, ...(options || [])];
  };

  const initialCompanyId = initialData?.profile?.company_id ?? initialData?.profile?.company?.id;
  const initialCoverage = initialData?.profile?.insuranceCoverage;
  const initialPlanType = initialData?.profile?.coverageType;

  const companies = ensureOptionVisible(companyOptions, initialCompanyId);
  const coverages = ensureOptionVisible(coverageOptions, initialCoverage);
  const planTypes = ensureOptionVisible(planTypeOptions, initialPlanType);

  useEffect(() => {
    if (!open) return;
    if (initialData?.user) {
      form.setFieldsValue({
        username: initialData.user.username,
        email: initialData.user.email,
        first_name: initialData.user.first_name,
        last_name: initialData.user.last_name,
        user_role_id: initialData.profile?.user_role_id,
        user_type_id: initialData.profile?.user_type_id,
        company_id: initialCompanyId,
        insuranceCoverage: initialCoverage,
        coverageType: initialPlanType,
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open]);

  const handleSave = () => {
    form.validateFields().then(onSave).catch(() => {});
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit User" : "Create New User"}
      okText={isEdit ? "Update" : "Create"}
      onCancel={onCancel}
      onOk={handleSave}
    >
      <Form form={form} layout="vertical" name="user_form">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input the username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input the email!" },
            { type: "email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={isEdit ? [] : [{ required: true, message: "Please input the password!" }]}
        >
          <Input.Password placeholder={isEdit ? "Leave blank to keep current password" : ""} />
        </Form.Item>

        <Form.Item name="first_name" label="First Name">
          <Input />
        </Form.Item>

        <Form.Item name="last_name" label="Last Name">
          <Input />
        </Form.Item>

        <Form.Item
          name="user_role_id"
          label="User Role"
          rules={[{ required: true, message: "Please select a role!" }]}
        >
          <Select options={roles} />
        </Form.Item>

        <Form.Item
          name="user_type_id"
          label="User Type"
          rules={[{ required: true, message: "Please select a type!" }]}
        >
          <Select options={types} />
        </Form.Item>

        <Form.Item name="company_id" label="Company" tooltip="Company linked to this user">
          <Select
            allowClear
            options={companies}
            placeholder="Select a company"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item name="insuranceCoverage" label="Plan Coverage" tooltip="Coverage / line of business">
          <Select
            allowClear
            options={coverages}
            placeholder="Select a coverage"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item name="coverageType" label="Plan Type" tooltip="Plan type (ex.: Individual, Family...)">
          <Select
            allowClear
            options={planTypes}
            placeholder="Select a plan type"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
