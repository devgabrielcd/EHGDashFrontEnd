"use client";

import React, { useState } from "react";
import {
  Card, Steps, Form, Input, Select, DatePicker, Checkbox, InputNumber,
  Space, Button, Divider, Tag, Typography, Row, Col, message
} from "antd";
import { RocketOutlined, FacebookOutlined, InstagramOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CHANNELS = [
  { key: "facebook", label: "Facebook", icon: <FacebookOutlined /> },
  { key: "instagram", label: "Instagram", icon: <InstagramOutlined /> },
  { key: "whatsapp", label: "WhatsApp", icon: <span style={{ fontWeight: 700 }}>WA</span> },
];

const OBJECTIVES = [
  { value: "awareness", label: "Brand awareness" },
  { value: "traffic", label: "Traffic" },
  { value: "leads", label: "Lead generation" },
  { value: "sales", label: "Sales/Conversions" },
];

const FORM_LAYOUT = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

export default function CampaignsPage() {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();

  const goNext = async () => {
    try {
      await form.validateFields();
      setStep((s) => Math.min(s + 1, 2));
    } catch {}
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // mock payload
      // console.log("payload", values);
      message.success("Campaign created (mock)!");
    } catch {}
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>
        <RocketOutlined style={{ marginRight: 8 }} />
        Campaigns
      </Title>
      <Text type="secondary">
        Create multi-channel campaigns (Facebook, Instagram, WhatsApp). This is a mock UI.
      </Text>

      <Card>
        <Steps
          current={step}
          items={[
            { title: "Basics" },
            { title: "Channels & Budget" },
            { title: "Review & Launch" },
          ]}
        />
        <Divider style={{ margin: "16px 0" }} />

        <Form
          form={form}
          layout="horizontal"
          initialValues={{
            name: "",
            objective: "traffic",
            dateRange: [dayjs().add(1, "day"), dayjs().add(14, "day")],
            channels: ["facebook", "instagram"],
            dailyBudget: 50,
            totalBudget: 700,
            targeting: "All regions",
          }}
          {...FORM_LAYOUT}
        >
          {step === 0 && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Campaign name"
                  name="name"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="e.g. Black Friday Awareness" maxLength={80} />
                </Form.Item>

                <Form.Item
                  label="Objective"
                  name="objective"
                  rules={[{ required: true }]}
                >
                  <Select options={OBJECTIVES} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Dates"
                  name="dateRange"
                  rules={[{ required: true }]}
                >
                  <RangePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Targeting" name="targeting">
                  <Input placeholder="e.g. Brazil · 18–55" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {step === 1 && (
            <>
              <Form.Item
                label="Channels"
                name="channels"
                rules={[{ required: true, message: "Choose at least one channel" }]}
              >
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row gutter={[12, 12]}>
                    {CHANNELS.map((c) => (
                      <Col key={c.key} xs={24} sm={12} md={8}>
                        <Checkbox value={c.key}>
                          <Space>
                            {c.icon}
                            {c.label}
                          </Space>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Daily budget" name="dailyBudget" rules={[{ required: true }]}>
                    <InputNumber min={5} style={{ width: "100%" }} prefix="US$" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Total budget" name="totalBudget" rules={[{ required: true }]}>
                    <InputNumber min={50} style={{ width: "100%" }} prefix="US$" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {step === 2 && (
            <Card type="inner" title="Review">
              <ReviewBlock form={form} />
            </Card>
          )}

          <Divider />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Space>
              <Button onClick={goPrev} disabled={step === 0}>Back</Button>
            </Space>
            <Space>
              {step < 2 ? (
                <Button type="primary" onClick={goNext}>Next</Button>
              ) : (
                <Button type="primary" onClick={handleSubmit}>Launch (mock)</Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>

      {/* Lista mock de campanhas recentes */}
      <Card title="Recent campaigns (mock)">
        <Row gutter={[16, 16]}>
          {["Autumn Sale", "Brand Lift Test", "Lead Magnet 2.0"].map((n, i) => (
            <Col key={i} xs={24} md={8}>
              <Card hoverable>
                <Space direction="vertical" size={6}>
                  <Text strong>{n}</Text>
                  <Space wrap>
                    <Tag color="blue">Facebook</Tag>
                    <Tag color="purple">Instagram</Tag>
                    {i % 2 === 0 && <Tag color="green">WhatsApp</Tag>}
                  </Space>
                  <Text type="secondary">Status: {i % 2 ? "Paused" : "Active"}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </Space>
  );
}

function ReviewBlock({ form }) {
  const v = form.getFieldsValue(true);
  const channels = (v.channels || []).map((c) => <Tag key={c}>{c}</Tag>);
  return (
    <Space direction="vertical" size={8}>
      <Text><b>Name:</b> {v.name || "-"}</Text>
      <Text><b>Objective:</b> {v.objective || "-"}</Text>
      <Text>
        <b>Dates:</b>{" "}
        {v.dateRange ? `${v.dateRange[0]?.format("YYYY-MM-DD")} → ${v.dateRange[1]?.format("YYYY-MM-DD")}` : "-"}
      </Text>
      <Text><b>Targeting:</b> {v.targeting || "-"}</Text>
      <Text><b>Channels:</b> {channels.length ? channels : "-"}</Text>
      <Text><b>Daily budget:</b> {v.dailyBudget ? `US$ ${v.dailyBudget}` : "-"}</Text>
      <Text><b>Total budget:</b> {v.totalBudget ? `US$ ${v.totalBudget}` : "-"}</Text>
    </Space>
  );
}
