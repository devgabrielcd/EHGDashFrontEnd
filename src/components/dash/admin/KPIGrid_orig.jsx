'use client';

import React from 'react';
import { Row, Col } from 'antd';
import KPIStat from './KPIStat';

export default function KPIGrid({ items = [] }) {
  return (
    <Row gutter={[16, 16]}>
      {items.map((k) => (
        <Col key={k.key} xs={24} sm={12} md={12} lg={6}>
          <KPIStat {...k} />
        </Col>
      ))}
    </Row>
  );
}
