// components/dash/admin/AdminHeader.jsx
// SERVER COMPONENT
import React from "react";
import { Card, Space, Tag } from "antd";
import { auth } from "@/auth";

export default async function AdminHeader() {
  const session = await auth();
  const user = session.user;
  const fullName = [user.details.first_name, user.details.middle_name, user.details.last_name].filter(Boolean).join(' ') || user?.user;

  console.log('AdminHeaderLog', user);
  
  const labelStyle = { color: "#6b7280", fontSize: 14 }; // gray-500/600
  if (session) {
    return (
      <Card>
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            Welcome, {fullName}
          </h3>

          <Space wrap>
            {user.details.user_type ? (
              <Tag color="geekblue">{String(user.details.user_type).toUpperCase()}</Tag>
            ) : null}
            {user.details.user_role ? (
              <Tag color="purple">{String(user.details.user_role).toUpperCase()}</Tag>
            ) : null}

            {user.details.email ? (
              <span style={labelStyle}>Email: {user.details.email}</span>
            ) : null}
            {user.details.phone_number ? (
              <span style={labelStyle}>Phone: {user.details.phone_number}</span>
            ) : null}
          </Space>
        </Space>
      </Card>
    );
  }
}