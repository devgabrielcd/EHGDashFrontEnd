"use client";

import React, { useState } from "react";
import {
  Card, Row, Col, Space, Typography, Button, Input, Select, Upload, Modal, Form, List, Tag, message
} from "antd";
import {
  PictureOutlined, UploadOutlined, MagicWandIcon as _,
} from "@ant-design/icons";

// não existe MagicWandIcon no antd/icons; vamos simular
const Wand = () => <span style={{ fontWeight: 800, fontSize: 16 }}>✨</span>;

const { Title, Text } = Typography;

const SIZES = [
  { value: "1080x1080", label: "Square (1080×1080)" },
  { value: "1080x1350", label: "Portrait (1080×1350)" },
  { value: "1920x1080", label: "Landscape (1920×1080)" },
  { value: "1080x1920", label: "Story/Reel (1080×1920)" },
];

const MOCK_CREATIVE = (i) => ({
  id: i,
  name: `Promo Banner #${i}`,
  size: i % 2 ? "1080x1080" : "1080x1920",
  tags: i % 2 ? ["promo", "blackfriday"] : ["story", "new"],
  thumb: "https://picsum.photos/seed/" + (1000 + i) + "/400/240",
});

export default function CreativesPage() {
  const [openAI, setOpenAI] = useState(false);
  const [form] = Form.useForm();

  const [items, setItems] = useState(Array.from({ length: 8 }, (_, i) => MOCK_CREATIVE(i + 1)));

  const handleGenerate = async () => {
    try {
      await form.validateFields();
      // mock creation
      const v = form.getFieldsValue();
      const id = items.length + 1;
      setItems([{ id, name: v.title || "AI Flyer", size: v.size, tags: ["ai"], thumb: "https://picsum.photos/seed/"+(2000+id)+"/400/240" }, ...items]);
      setOpenAI(false);
      message.success("Creative generated (mock)!");
    } catch {}
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>
        <PictureOutlined style={{ marginRight: 8 }} />
        Creative Library
      </Title>
      <Text type="secondary">
        Generate and manage social creatives. This is a mock UI (no real uploads/AI yet).
      </Text>

      {/* Actions */}
      <Space wrap>
        <Button type="primary" icon={<Wand />} onClick={() => setOpenAI(true)}>
          Generate with AI
        </Button>
        <Upload multiple showUploadList={false} beforeUpload={() => false}>
          <Button icon={<UploadOutlined />}>Upload creative</Button>
        </Upload>
      </Space>

      {/* Filters */}
      <Card>
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Input placeholder="Search by name…" allowClear />
          </Col>
          <Col xs={24} md={8}>
            <Select
              style={{ width: "100%" }}
              options={[{ value: "", label: "All sizes" }, ...SIZES]}
              defaultValue=""
            />
          </Col>
        </Row>
      </Card>

      {/* Grid */}
      <Row gutter={[16, 16]}>
        {items.map((c) => (
          <Col key={c.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <div style={{ height: 180, background: "#111", display: "grid", placeItems: "center" }}>
                  <img src={c.thumb} alt={c.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
                </div>
              }
              actions={[
                <a key="use">Use</a>,
                <a key="dup">Duplicate</a>,
                <a key="del" style={{ color: "#ff7875" }}>Delete</a>,
              ]}
            >
              <Space direction="vertical" size={4}>
                <Text strong>{c.name}</Text>
                <Text type="secondary">{c.size}</Text>
                <Space wrap>
                  {c.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* AI Modal */}
      <Modal
        title="Generate creative with AI"
        open={openAI}
        onCancel={() => setOpenAI(false)}
        onOk={handleGenerate}
        okText="Generate"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            prompt: "Modern blue promo for healthcare brand",
            size: "1080x1080",
            title: "Promo Flyer",
          }}
        >
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Winter Sale Flyer" />
          </Form.Item>
          <Form.Item label="Prompt" name="prompt" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Describe what you want…" />
          </Form.Item>
          <Form.Item label="Size" name="size" rules={[{ required: true }]}>
            <Select options={SIZES} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
