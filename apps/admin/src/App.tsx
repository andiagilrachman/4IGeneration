import { Layout, Menu, Typography } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CreditCardOutlined,
  RobotOutlined,
  ApiOutlined,
  LineChartOutlined,
  FileTextOutlined,
  MailOutlined,
  SettingOutlined,
  LockOutlined,
  ToolOutlined,
} from "@ant-design/icons";

/**
 * Admin Panel — scaffold placeholder.
 * TODO (Week 7-8 roadmap): wire Refine.dev + dataProvider ke NestJS API,
 * lalu bangun halaman CRUD: users, plans, providers, provider-keys,
 * models, prompts, stocks, settings, feature-flags, audit-logs (BAGIAN 9).
 */

const menuItems = [
  { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "users", icon: <UserOutlined />, label: "User Management" },
  { key: "billing", icon: <CreditCardOutlined />, label: "Subscription & Billing" },
  { key: "ai", icon: <RobotOutlined />, label: "AI Configuration" },
  { key: "api", icon: <ApiOutlined />, label: "API Management" },
  { key: "stocks", icon: <LineChartOutlined />, label: "Stock Data" },
  { key: "content", icon: <FileTextOutlined />, label: "Content" },
  { key: "email", icon: <MailOutlined />, label: "Email & Notifications" },
  { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  { key: "security", icon: <LockOutlined />, label: "Security" },
  { key: "system", icon: <ToolOutlined />, label: "System" },
];

export default function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ padding: 16, color: "#fff", fontWeight: 700 }}>4IG · Admin</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["dashboard"]} items={menuItems} />
      </Layout.Sider>
      <Layout>
        <Layout.Content style={{ padding: 24 }}>
          <Typography.Title level={3}>Admin Panel — Scaffold</Typography.Title>
          <Typography.Paragraph type="secondary">
            Refine.dev akan dihubungkan ke API pada Week 7-8 (BAGIAN 15 roadmap).
            Menu di kiri = struktur lengkap Admin Panel (BAGIAN 9 blueprint).
          </Typography.Paragraph>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
