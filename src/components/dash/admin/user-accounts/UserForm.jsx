"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Row, Col } from "antd";

export default function UserForm({
  open,
  onCancel,
  onSave,
  isEdit = false,
  initialData = null,
  roles = [],
  types = [],
  companyOptions = [],
  coverageOptions = [],
  planTypeOptions = [],
  formTypeOptions = [],
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;

    let init = {};
    if (initialData?.user) {
      const u = initialData.user || {};
      const p = initialData.profile || {};

      // 🔑 normalize company_id como string para casar com options [{label, value: "1"}]
      const companyId =
        p?.company ?? p?.company_id ?? "";

      init = {
        username: u.username || "",
        email: u.email || "",
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        user_role_id: p.user_role_id ?? undefined,
        user_type_id: p.user_type_id ?? undefined,
        company_id: companyId !== "" && companyId != null ? String(companyId) : "", // 👈 aqui
        insuranceCoverage: p.insuranceCoverage ?? undefined,
        coverageType: p.coverageType ?? undefined,
        formType: undefined, // opcional
      };
    }
    form.setFieldsValue(init);
  }, [open, initialData, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSave(values); // backend já aceita string, ele faz _safe_int
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit user" : "Create user"}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isEdit ? "Save" : "Create"}
      forceRender           // garante que <Form> existe (evita warning do useForm)
      destroyOnHidden       // API correta no AntD v5
      afterOpenChange={(visible) => {
        if (!visible) form.resetFields();
      }}
    >
      <Form form={form} layout="vertical" name="user_form">
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {!isEdit && (
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, min: 6 }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="first_name" label="First name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="last_name" label="Last name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="user_role_id" label="User role">
              <Select options={roles} allowClear placeholder="Select a role" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="user_type_id" label="User type">
              <Select options={types} allowClear placeholder="Select a type" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="company_id" label="Company">
              <Select
                // options devem ser [{label: company.name, value: String(company.id)}]
                options={companyOptions.filter((o) => o.value !== "")}
                allowClear
                placeholder="Select a company"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="insuranceCoverage" label="Plan coverage">
              <Select
                options={coverageOptions}
                allowClear
                placeholder="Health, Dental, Life..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="coverageType" label="Plan type">
              <Select
                options={planTypeOptions}
                allowClear
                placeholder="Individual / Family"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="formType" label="Form type (optional)">
              <Select
                options={formTypeOptions}
                allowClear
                placeholder="Homepage / Referral / Appointment"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
