import { useState } from "react";
import { Button, Form, Input, Layout, Menu, Typography, message } from "antd";
import {
  ApiOutlined,
  DashboardOutlined,
  KeyOutlined,
  LogoutOutlined,
  RobotOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { getToken, loginAdmin, logoutAdmin } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import Models from "./pages/Models";
import Keys from "./pages/Keys";
import Plans from "./pages/Plans";
import Settings from "./pages/Settings";

type PageKey = "dashboard" | "providers" | "models" | "keys" | "plans" | "settings";

const menuItems = [
  { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "providers", icon: <ApiOutlined />, label: "AI Providers" },
  { key: "models", icon: <RobotOutlined />, label: "AI Models" },
  { key: "keys", icon: <KeyOutlined />, label: "Provider Keys" },
  { key: "plans", icon: <SettingOutlined />, label: "Plans" },
  { key: "settings", icon: <SettingOutlined />, label: "Konfigurasi" },
];

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  async function submit(values: { email: string; password: string }) {
    setLoading(true);
    try {
      await loginAdmin(values.email, values.password);
      message.success("Login berhasil");
      onLogin();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
      }}
    >
      <div style={{ width: 360, padding: 32, background: "#0f1424", borderRadius: 12, border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 0 30px rgba(124,58,237,0.25)" }}>
        <Typography.Title level={3} style={{ marginBottom: 4, color: "#c4b5fd" }}>
          🛸 4IGeneration Admin
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Panel pengelolaan AI configuration
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={submit}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input placeholder="admin@4igeneration.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password admin" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Masuk
          </Button>
        </Form>
        <Typography.Paragraph type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
          Default seed: admin@4igeneration.com / admin12345 (ganti di production!)
        </Typography.Paragraph>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => !!getToken());
  const [page, setPage] = useState<PageKey>("dashboard");

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  async function handleLogout() {
    await logoutAdmin();
    setAuthed(false);
    setPage("dashboard");
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider breakpoint="lg" collapsedWidth="0" theme="dark">
        <div
          style={{
            color: "#a78bfa",
            padding: 16,
            fontWeight: 700,
            fontSize: 15,
            whiteSpace: "nowrap",
          }}
        >
          🛸 4IG · Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[page]}
          items={menuItems}
          onClick={(e) => setPage(e.key as PageKey)}
        />
        <div style={{ padding: 16, position: "absolute", bottom: 0 }}>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            size="small"
            danger
            ghost
            style={{ width: "100%" }}
          >
            Keluar
          </Button>
        </div>
      </Layout.Sider>
      <Layout>
        <Layout.Content style={{ padding: 24, background: "#070b18", minHeight: "100vh" }}>
          {page === "dashboard" && <Dashboard />}
          {page === "providers" && <Providers />}
          {page === "models" && <Models />}
          {page === "keys" && <Keys />}
          {page === "plans" && <Plans />}
          {page === "settings" && <Settings />}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
