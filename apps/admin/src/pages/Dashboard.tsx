import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";
import { api } from "../lib/api";

interface Stats {
  providers: number;
  keys: number;
  models: number;
  users: number;
  activeProviders: { slug: string; name: string; priority: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/admin/dashboard/stats").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div>
      <Typography.Title level={4}>Dashboard</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card><Statistic title="AI Providers" value={stats?.providers ?? "—"} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Provider Keys" value={stats?.keys ?? "—"} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="AI Models" value={stats?.models ?? "—"} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Users" value={stats?.users ?? "—"} /></Card>
        </Col>
      </Row>

      <Card title="Provider Aktif (urutan priority)" style={{ marginTop: 16 }}>
        <Table
          rowKey="slug"
          dataSource={stats?.activeProviders ?? []}
          pagination={false}
          size="small"
          columns={[
            { title: "Slug", dataIndex: "slug" },
            { title: "Nama", dataIndex: "name" },
            {
              title: "Priority",
              dataIndex: "priority",
              render: (p: number) => <Tag color={p === 1 ? "purple" : "blue"}>{p}</Tag>,
            },
          ]}
          locale={{ emptyText: "Belum ada provider — tambahkan di menu Providers" }}
        />
      </Card>
    </div>
  );
}
