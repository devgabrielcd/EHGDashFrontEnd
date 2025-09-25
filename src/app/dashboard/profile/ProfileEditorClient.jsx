"use client";

import React, { useEffect } from "react";
import { Card, Form, Input, Select, Row, Col, Button, App } from "antd";

export default function ProfileEditorClient({
  initialUser = {},
  initialProfile = {},
  companies = [],
  apiBase,
  accessToken,
}) {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  // Normaliza companies => [{label, value}]
  const companyOptions = [{ label: "Select a company", value: "" }].concat(
    (companies || [])
      .filter((c) => c?.id && c?.name)
      .map((c) => ({ label: c.name, value: String(c.id) }))
  );

  useEffect(() => {
    const init = {
      first_name: initialUser.first_name || "",
      last_name: initialUser.last_name || "",
      email: initialUser.email || "",
      phone_number: initialProfile.phone_number || "",
      company_id:
        initialProfile.company != null ? String(initialProfile.company) : "",
      insuranceCoverage: initialProfile.insuranceCoverage || undefined,
      coverageType: initialProfile.coverageType || undefined,
    };
    form.setFieldsValue(init);
  }, [initialUser, initialProfile, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number ?? null,
        company_id: values.company_id || null,
        insuranceCoverage: values.insuranceCoverage || null,
        coverageType: values.coverageType || null,
      };

      const res = await fetch(`${apiBase}/api/users/${initialUser.id || initialProfile?.user || initialUser?.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);

      message.success("Profile updated!");
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Failed to update profile");
    }
  };

  return (
    <Card title="My Profile">
      <Form form={form} layout="vertical" name="profile_editor_form">
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="first_name"
              label="First name"
              rules={[{ required: true, message: "Please input your first name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="last_name"
              label="Last name"
              rules={[{ required: true, message: "Please input your last name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone_number" label="Phone">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="company_id" label="Company">
              <Select options={companyOptions} allowClear placeholder="Select a company" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="insuranceCoverage" label="Plan coverage">
              <Select
                allowClear
                placeholder="Health / Dental / Life / Vision"
                options={[
                  { label: "Health", value: "Health" },
                  { label: "Dental", value: "Dental" },
                  { label: "Life", value: "Life" },
                  { label: "Vision", value: "Vision" },
                  { label: "Medicare", value: "Medicare" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="coverageType" label="Plan type">
              <Select
                allowClear
                placeholder="Individual / Family"
                options={[
                  { label: "individual", value: "individual" },
                  { label: "family", value: "family" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" onClick={handleSave}>Save changes</Button>
      </Form>
    </Card>
  );
}
