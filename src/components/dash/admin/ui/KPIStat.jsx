

import React from "react";
import { Card, Statistic } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";

// Mapa de ícones
const iconMap = {
  user: <UserOutlined />,
  team: <TeamOutlined />,
  file: <FileTextOutlined />,
  setting: <SettingOutlined />,
};

export default function KPIStat({ title, value, icon, color = "#555" }) {
  const iconElement = iconMap[icon] || <UserOutlined />;

  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={React.cloneElement(iconElement, {
          style: { color, fontSize: 28, marginRight: 8 },
        })}
      />
    </Card>
  );
}
