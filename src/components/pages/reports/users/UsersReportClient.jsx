// src/components/reports/users/UsersReportClient.jsx
"use client";

import React from "react";
import { Card, Row, Col, Space, Typography, Table, Tag, Alert } from "antd";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

const { Title, Text } = Typography;

export default function UsersReportClient({ data = {}, disabled = false }) {
  if (disabled) {
    return (
      <Card>
        <Alert
          type="info"
          message="Faça login para visualizar o relatório de usuários."
          showIcon
        />
      </Card>
    );
  }

  const {
    totalUsers = 0,
    signupsSeries = [],
    formSources = [],
    topZips = [],
    topPlans = [],
    planTypes = [],
    months = 6,
  } = data;

  const columnsSimple = (label) => [
    { title: label, dataIndex: "name", key: "name" },
    { title: "Count", dataIndex: "count", key: "count", align: "right" },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Users overview</Title>
          <Text type="secondary">
            {`Cadastros nos últimos ${months} meses, origens, ZIPs e planos.`}
          </Text>
        </div>
        <Tag color="geekblue">Total: {totalUsers}</Tag>
      </div>

      <Row gutter={[16, 16]}>
        {/* Cadastros por mês */}
        <Col xs={24} lg={14}>
          <Card title={`Signups (last ${months} months)`}>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupsSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, "Users"]} />
                  <Line type="monotone" dataKey="count" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Origens de formulário / site */}
        <Col xs={24} lg={10}>
          <Card title="Form / Site source (top)">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formSources} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {!formSources.length && (
              <Text type="secondary">
                Nenhuma origem detectada. Assim que o backend enviar <code>formType/signupSource</code>, aparece aqui.
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Planos mais escolhidos */}
        <Col xs={24} lg={12}>
          <Card title="Top plans (insuranceCoverage)">
            <Table
              size="small"
              rowKey={(r) => r.name}
              dataSource={topPlans}
              columns={columnsSimple("Plan")}
              pagination={{ pageSize: 5 }}
            />
            {!topPlans.length && <Text type="secondary">Sem dados de planos.</Text>}
          </Card>
        </Col>
        {/* Tipos de plano */}
        <Col xs={24} lg={12}>
          <Card title="Plan types (coverageType)">
            <Table
              size="small"
              rowKey={(r) => r.name}
              dataSource={planTypes}
              columns={columnsSimple("Type")}
              pagination={{ pageSize: 5 }}
            />
            {!planTypes.length && <Text type="secondary">Sem dados de tipo de plano.</Text>}
          </Card>
        </Col>
      </Row>

      {/* ZIP Codes */}
      <Card title="Top ZIP codes">
        <Table
          size="small"
          rowKey={(r) => r.name}
          dataSource={topZips}
          columns={columnsSimple("ZIP")}
          pagination={{ pageSize: 10 }}
        />
        {!topZips.length && (
          <Text type="secondary">
            Nenhum ZIP code encontrado. Assim que o backend enviar <code>zipcode</code>, aparece aqui.
          </Text>
        )}
      </Card>
    </Space>
  );
}
