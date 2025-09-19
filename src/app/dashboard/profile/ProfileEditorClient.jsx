"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Button, Select, Row, Col, Divider, Typography, message } from "antd";

function toInitialValues(user = {}, profile = {}) {
  // tenta vários formatos possíveis que seu serializer pode mandar
  const companyId =
    profile?.company_id ??
    (typeof profile?.company === "number" ? profile.company : profile?.company?.id) ??
    null;

  return {
    username: user?.username ?? "",
    email: user?.email ?? profile?.email ?? "",
    first_name: profile?.first_name ?? user?.first_name ?? "",
    last_name: profile?.last_name ?? user?.last_name ?? "",
    phone_number: profile?.phone_number ?? "",
    company_id: companyId,
    coverageType: profile?.coverageType ?? "",         // 'individual' | 'family' | ...
    insuranceCoverage: profile?.insuranceCoverage ?? "",// 'Medicare' | 'Dental' | ...
    password: "", // opcional
  };
}

function mapToPatchBody(values) {
  const body = {
    username: values.username?.trim(),
    email: values.email?.trim(),
    first_name: values.first_name?.trim(),
    last_name: values.last_name?.trim(),
    phone_number: values.phone_number?.trim(),
    coverageType: values.coverageType || null,
    insuranceCoverage: values.insuranceCoverage || null,
    company_id: values.company_id ? Number(values.company_id) : null,
  };
  if (values.password) {
    body.password = values.password;
  }
  return body;
}

function companyOptionsFromList(companies = []) {
  return [
    { label: "— selecionar —", value: null },
    ...companies
      .filter((c) => c?.id && c?.name)
      .map((c) => ({ label: c.name, value: c.id })),
  ];
}

export default function ProfileEditorClient({
  initialUser,
  initialProfile,
  companies,
  apiBase,
  accessToken,
}) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const initialValues = useMemo(
    () => toInitialValues(initialUser, initialProfile),
    [initialUser, initialProfile]
  );

  // Garante que o form reflita mudanças de props (navegação/refresh)
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const body = mapToPatchBody(values);
      const userId = initialUser?.id;
      if (!userId) throw new Error("ID do usuário não encontrado.");

      const res = await fetch(`${apiBase}/api/users/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        if (res.status === 403) {
          throw new Error("Sem permissão para atualizar (PATCH é restrito a admins).");
        }
        throw new Error(`Falha ao salvar: HTTP ${res.status} ${txt || res.statusText}`);
      }

      const json = await res.json().catch(() => ({}));
      message.success("Perfil atualizado com sucesso!");

      // Rehidrata com a resposta do backend (fonte da verdade)
      const next = toInitialValues(json?.user, json?.profile);
      form.setFieldsValue(next);
      form.resetFields(["password"]);
    } catch (e) {
      message.error(e?.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const coverageTypeOptions = [
    { label: "— selecionar —", value: "" },
    { label: "individual", value: "individual" },
    { label: "family", value: "family" },
  ];

  const insuranceCoverageOptions = [
    { label: "— selecionar —", value: "" },
    { label: "Medicare", value: "Medicare" },
    { label: "Dental", value: "Dental" },
    { label: "Life", value: "Life" },
    { label: "Health", value: "Health" },
    { label: "Vision", value: "Vision" },
  ];

  return (
    <div className="max-w-3xl">
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Informe o username" }]}
            >
              <Input placeholder="seu.username" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Informe o email" },
                { type: "email", message: "Email inválido" },
              ]}
            >
              <Input placeholder="voce@empresa.com" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Primeiro nome" name="first_name">
              <Input placeholder="Primeiro nome" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Sobrenome" name="last_name">
              <Input placeholder="Sobrenome" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Telefone" name="phone_number">
              <Input placeholder="(00) 00000-0000" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Empresa" name="company_id">
              <Select
                options={companyOptionsFromList(companies)}
                placeholder="Selecione a empresa"
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Planos (System Health)</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Coverage Type" name="coverageType">
              <Select options={coverageTypeOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Insurance Coverage" name="insuranceCoverage">
              <Select options={insuranceCoverageOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Segurança</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Nova senha"
              name="password"
              tooltip="Opcional — preencha apenas se deseja alterar"
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" gutter={12}>
          <Col>
            <Button htmlType="reset">Limpar</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={saving}>
              Salvar alterações
            </Button>
          </Col>
        </Row>
      </Form>

      <Typography.Paragraph type="secondary" className="mt-4">
        Observação: Caso receba <code>403 Forbidden</code> ao salvar, é porque o PATCH está
        restrito a administradores no backend. Você pode liberar alteração do próprio usuário
        ou manter apenas para admins.
      </Typography.Paragraph>
    </div>
  );
}
