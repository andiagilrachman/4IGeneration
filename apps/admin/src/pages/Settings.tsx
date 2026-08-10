import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
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

interface Setting {
  id: string;
  category: string;
  key: string;
  value: unknown;
  isSecret: boolean;
  updatedAt?: string;
}

const CATEGORIES = ["general", "email", "payments", "security", "notifications", "integrations"];

export default function SettingsPage() {
  const [data, setData] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      const url = categoryFilter ? `/admin/settings/${categoryFilter}` : "/admin/settings";
      setData(await api<Setting[]>(url));
    } catch {
      message.error("Gagal memuat settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [categoryFilter]);

  function openCreate() {
    form.resetFields();
    form.setFieldsValue({ category: categoryFilter || "general", isSecret: false });
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    try {
      await api(`/admin/settings/${values.category}`, {
        method: "POST",
        body: { key: values.key, value: values.value, isSecret: values.isSecret },
      });
      message.success("Setting disimpan");
      setOpen(false);
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  async function remove(category: string, key: string) {
    try {
      await api(`/admin/settings/${category}/${key}`, { method: "DELETE" });
      message.success("Setting dihapus");
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Konfigurasi (Settings)
        </Typography.Title>
        <Space>
          <Select
            placeholder="Semua kategori"
            allowClear
            style={{ width: 180 }}
            onChange={(v) => setCategoryFilter(v ?? "")}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tambah Setting
          </Button>
        </Space>
      </div>

      <Card>
        <p style={{ marginBottom: 12, color: "#888" }}>
          ⚙️ Prinsip "no hardcode" — semua konfigurasi (email, payment, dll) dikelola di sini,
          tersimpan di database.
        </p>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          pagination={false}
          size="small"
          columns={[
            {
              title: "Kategori",
              dataIndex: "category",
              render: (c: string) => <Tag color="blue">{c}</Tag>,
            },
            { title: "Key", dataIndex: "key", render: (k: string) => <code>{k}</code> },
            {
              title: "Value",
              dataIndex: "value",
              render: (v: unknown, r) =>
                r.isSecret ? (
                  <Typography.Text type="secondary">••••••</Typography.Text>
                ) : (
                  <Typography.Text>{String(v ?? "")}</Typography.Text>
                ),
            },
            {
              title: "Secret",
              dataIndex: "isSecret",
              render: (s: boolean) => (s ? <Tag color="gold">SECRET</Tag> : <Tag>Publik</Tag>),
            },
            {
              title: "Aksi",
              render: (_, r) => (
                <Popconfirm title={`Hapus ${r.category}.${r.key}?`} onConfirm={() => remove(r.category, r.key)}>
                  <Button size="small" danger>
                    Hapus
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
          locale={{ emptyText: "Belum ada setting — tambahkan untuk mengonfigurasi sistem" }}
        />
      </Card>

      <Modal title="Tambah / Update Setting" open={open} onOk={submit} onCancel={() => setOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="category" label="Kategori" rules={[{ required: true }]}>
            <Select options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Form.Item>
          <Form.Item name="key" label="Key" rules={[{ required: true }]}>
            <Input placeholder="mis. from_email / api_key / smtp_host" />
          </Form.Item>
          <Form.Item name="value" label="Value" rules={[{ required: true }]}>
            <Input placeholder="Nilai setting" />
          </Form.Item>
          <Form.Item name="isSecret" label="Secret (nilai disembunyikan)" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
