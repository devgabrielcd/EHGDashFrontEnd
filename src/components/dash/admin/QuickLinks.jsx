'use client';

import React, { useMemo, useRef } from 'react';
import { Card, Row, Col, Avatar, Typography, Button, Carousel, Space, Tooltip } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ICONS = {
  user: <UserOutlined />,
  team: <TeamOutlined />,
  file: <FileTextOutlined />,
  setting: <SettingOutlined />,
};

// Faz “paginacao” do array em blocos (ex.: 8 por página)
function chunk(arr, size) {
  if (!Array.isArray(arr) || size <= 0) return [arr ?? []];
  const pages = [];
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size));
  return pages;
}

function LinkCard({ q }) {
  return (
    <Card
      hoverable
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 16,
          minHeight: 160,
        },
      }}
    >
      <Avatar
        size={48}
        style={{ backgroundColor: q.color || '#999', marginBottom: 8 }}
        icon={ICONS[q.icon] || <SettingOutlined />}
      />
      <Text strong style={{ marginBottom: 8, display: 'block' }}>
        {q.title}
      </Text>
      <Button type="primary" href={q.href}>
        Open
      </Button>
    </Card>
  );
}

export default function QuickLinks({
  items = [],
  // quantos cards por página: 8 dá 4 colunas x 2 linhas no desktop
  pageSize = 8,
}) {
  const carouselRef = useRef(null);

  // Se couber em uma página, mostra grid estático.
  const needsCarousel = items.length > pageSize;

  // Quebra em páginas quando necessário
  const pages = useMemo(() => (needsCarousel ? chunk(items, pageSize) : [items]), [items, needsCarousel, pageSize]);

  const extra =
    needsCarousel ? (
      <Space>
        <Tooltip title="Anterior">
          <Button
            shape="circle"
            size="small"
            icon={<LeftOutlined />}
            onClick={() => carouselRef.current?.prev()}
          />
        </Tooltip>
        <Tooltip title="Próximo">
          <Button
            shape="circle"
            size="small"
            icon={<RightOutlined />}
            onClick={() => carouselRef.current?.next()}
          />
        </Tooltip>
      </Space>
    ) : null;

  return (
    <Card title="Quick Links" extra={extra}>
      {needsCarousel ? (
        <Carousel ref={carouselRef} dots>
          {pages.map((page, idx) => (
            <div key={`ql-page-${idx}`}>
              <Row gutter={[16, 16]}>
                {page.map((q) => (
                  <Col key={q.title} xs={24} sm={12} lg={6}>
                    <LinkCard q={q} />
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Carousel>
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((q) => (
            <Col key={q.title} xs={24} sm={12} lg={6}>
              <LinkCard q={q} />
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
}
