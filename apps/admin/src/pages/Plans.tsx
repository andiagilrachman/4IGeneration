import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { api } from "../lib/api";

interface Plan {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  type: string;
  priceMonthly: string | number;
  priceYearly?: string | number | null;
  currency: string;
  creditsPerMonth: number;
  features?: unknown;
  isActive: boolean;
  sortOrder: number;
  _count?: { subscriptions: number };
}

export default function Plans() {
  const [data, setData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      setData(await api<Plan[]>("/admin/plans"));
    } catch {
      message.error("Gagal memuat plans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      type: "RETAIL",
      currency: "IDR",
      priceMonthly: 0,
      priceYearly: 0,
      creditsPerMonth: 0,
      isActive: true,
      sortOrder: 0,
      features: '["fitur default"]',
    });
    setOpen(true);
  }

  function openEdit(p: Plan) {
    setEditing(p);
    form.setFieldsValue({
      ...p,
      priceMonthly: Number(p.priceMonthly),
      priceYearly: p.priceYearly != null ? Number(p.priceYearly) : 0,
      features: p.features ? JSON.stringify(p.features) : '[]',
    });
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    let features: string[] = [];
    if (typeof values.features === "string" && values.features.trim()) {
      try {
        features = JSON.parse(values.features);
      } catch {
        message.error("Kolom Features harus JSON valid, contoh: [\"fitur A\", \"fitur B\"]");
        return;
      }
    }
    const payload = { ...values, features };
    try {
      if (editing) {
        await api(`/admin/plans/${editing.id}`, { method: "PUT", body: payload });
        message.success("Plan diperbarui");
      } else {
        await api("/admin/plans", { method: "POST", body: payload });
        message.success("Plan dibuat");
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  async function remove(p: Plan) {
    try {
      await api(`/admin/plans/${p.id}`, { method: "DELETE" });
      message.success("Plan dihapus");
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      render: (_: unknown, r: Plan) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{r.name}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {r.slug}
          </Typography.Text>
        </Space>
      ),
    },
    { title: "Tipe", dataIndex: "type", width: 110, render: (t: string) => <Tag>{t}</Tag> },
    {
      title: "Harga/bulan",
      dataIndex: "priceMonthly",
      width: 130,
      render: (v: string | number, r: Plan) => (
        <Typography.Text>
          {r.currency === "USD" ? "$" : "Rp "}
          {Number(v).toLocaleString("id-ID")}
        </Typography.Text>
      ),
    },
    {
      title: "Kredit/bln",
      dataIndex: "creditsPerMonth",
      width: 110,
      render: (v: number) => v.toLocaleString("id-ID"),
    },
    {
      title: "Subscriber",
      key: "subs",
      width: 100,
      render: (_: unknown, r: Plan) => (r._count?.subscriptions ?? 0) ?? 0,
    },
    {
      title: "Aktif",
      dataIndex: "isActive",
      width: 80,
      render: (v: boolean) => (v ? <Tag color="green">Ya</Tag> : <Tag color="default">Tidak</Tag>),
    },
    {
      title: "Aksi",
      key: "actions",
      width: 150,
      render: (_: unknown, r: Plan) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Popconfirm title="Hapus plan ini?" onConfirm={() => remove(r)}>
            <Button size="small" danger>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Paket Subscription
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tambah Plan
        </Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />

      <Modal
        title={editing ? "Edit Plan" : "Tambah Plan"}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nama" rules={[{ required: true }]}>
            <Input placeholder="Starter" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug (unik)"
            rules={[{ required: true, pattern: /^[a-z0-9-]+$/, message: "huruf kecil & dash saja" }]}
          >
            <Input placeholder="starter" />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea rows={2} placeholder="Untuk investor pemula" />
          </Form.Item>
          <Space style={{ display: "flex" }} size={12}>
            <Form.Item name="type" label="Tipe" style={{ flex: 1 }}>
              <Select
                options={[
                  { value: "FREE", label: "FREE" },
                  { value: "RETAIL", label: "RETAIL" },
                  { value: "API", label: "API" },
                  { value: "ENTERPRISE", label: "ENTERPRISE" },
                ]}
              />
            </Form.Item>
            <Form.Item name="currency" label="Mata Uang" style={{ flex: 1 }}>
              <Select
                options={[
                  { value: "IDR", label: "IDR" },
                  { value: "USD", label: "USD" },
                ]}
              />
            </Form.Item>
          </Space>
          <Space style={{ display: "flex" }} size={12}>
            <Form.Item name="priceMonthly" label="Harga/bulan" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="priceYearly" label="Harga/tahun" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="creditsPerMonth" label="Kredit/bln" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
          <Form.Item
            name="features"
            label="Fitur (JSON array)"
            tooltip='Contoh: ["Analisis tak terbatas", "API 10K req/bln"]'
          >
            <Input.TextArea rows={3} placeholder='["fitur 1", "fitur 2"]' />
          </Form.Item>
          <Space size={24}>
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sortOrder" label="Urutan">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
