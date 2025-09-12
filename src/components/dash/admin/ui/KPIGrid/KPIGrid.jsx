

import React from "react";
import { Row, Col } from "antd";
import KPIStat from "../KPIStat";

export default function KPIGrid({ items = [] }) {
  return (
    <Row gutter={[16, 16]}>
      {items.map((k) => {
        // remove "key" do objeto antes de espalhar
        const { key, ...rest } = k || {};
        const colKey =
          key ?? rest.id ?? rest.title ?? Math.random().toString(36).slice(2);

        return (
          <Col key={colKey} xs={24} sm={12} md={12} lg={6}>
            {/* Passa todos os props (inclusive color) para KPIStat */}
            <KPIStat {...rest} />
          </Col>
        );
      })}
    </Row>
  );
}
