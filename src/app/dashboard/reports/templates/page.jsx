"use client";

import React from "react";
import { Typography, Row, Col, Card, Space, Tag, Button } from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  LineChartOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

const TEMPLATES = [
  {
    id: "sales_monthly",
    title: "Monthly Sales",
    icon: <BarChartOutlined />,
    tags: ["Sales", "Monthly"],
    description: "Revenue, AOV, orders and regional breakdown for last months.",
  },
  {
    id: "user_growth",
    title: "User Growth",
    icon: <UserOutlined />,
    tags: ["Users", "Acquisition"],
    description: "New vs returning users, MAU/WAU, conversion and channels.",
  },
  {
    id: "churn_cohort",
    title: "Churn Cohorts",
    icon: <LineChartOutlined />,
    tags: ["Retention", "Cohorts"],
    description: "Cohort retention, churn risk and winback windows.",
  },
  {
    id: "nps_weekly",
    title: "NPS Weekly",
    icon: <SmileOutlined />,
    tags: ["Satisfaction", "Support"],
    description: "NPS evolution, promoters/detractors and verbatim sampling.",
  },
];

export default function ReportTemplatesPage() {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Report templates</Title>
          <Text type="secondary">Start from a preset and customize before creating.</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {TEMPLATES.map((t) => (
          <Col key={t.id} xs={24} sm={12} lg={8}>
            <Card
              title={
                <Space>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  <span style={{ fontWeight: 700 }}>{t.title}</span>
                </Space>
              }
              actions={[
                <Link key="use" href={`/dashboard/reports/new?template=${t.id}`}>
                  <Button type="link">Use template</Button>
                </Link>,
              ]}
            >
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Text type="secondary">{t.description}</Text>
                <Space wrap>
                  {t.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
