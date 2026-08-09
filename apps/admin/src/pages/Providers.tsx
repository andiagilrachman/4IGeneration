import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { api } from "../lib/api";

interface Provider {
  id: string;
  slug: string;
  name: string;
  baseUrl: string;
  authType: string;
  priority: number;
  weight: number;
  timeoutMs: number;
  maxRetries: number;
  isActive: boolean;
  _count?: { keys: number; models: number };
}

export default function Providers() {
  const [data, setData] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      setData(await api<Provider[]>("/admin/providers"));
    } catch {
      message.error("Gagal memuat providers");
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
    form.setFieldsValue({ authType: "api_key_header", priority: 100, weight: 0, timeoutMs: 30000, maxRetries: 3, isActive: true });
    setOpen(true);
  }

  function openEdit(p: Provider) {
    setEditing(p);
    form.setFieldsValue(p);
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api(`/admin/providers/${editing.id}`, { method: "PUT", body: values });
        message.success("Provider diperbarui");
      } else {
        await api("/admin/providers", { method: "POST", body: values });
        message.success("Provider dibuat");
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  async function remove(p: Provider) {
    try {
      await api(`/admin/providers/${p.id}`, { method: "DELETE" });
      message.success("Provider dihapus");
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          AI Providers
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tambah Provider
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: "Slug",
            dataIndex: "slug",
            render: (s: string) => <Tag color="purple">{s}</Tag>,
          },
          { title: "Nama", dataIndex: "name" },
          { title: "Base URL", dataIndex: "baseUrl", ellipsis: true },
          {
            title: "Priority",
            dataIndex: "priority",
            render: (p: number) => <Tag color={p === 1 ? "gold" : "blue"}>{p}</Tag>,
          },
          { title: "Weight %", dataIndex: "weight" },
          {
            title: "Aktif",
            dataIndex: "isActive",
            render: (v: boolean) => (v ? <Tag color="success">AKTIF</Tag> : <Tag>NONAKTIF</Tag>),
          },
          {
            title: "Keys/Models",
            render: (_, p) => `${p._count?.keys ?? 0} / ${p._count?.models ?? 0}`,
          },
          {
            title: "Aksi",
            render: (_, p) => (
              <Space>
                <Button size="small" onClick={() => openEdit(p)}>
                  Edit
                </Button>
                <Popconfirm title="Hapus provider ini?" onConfirm={() => remove(p)}>
                  <Button size="small" danger>
                    Hapus
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Edit Provider" : "Tambah Provider"}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input placeholder="gemini / groq / openrouter" />
          </Form.Item>
          <Form.Item name="name" label="Nama" rules={[{ required: true }]}>
            <Input placeholder="Google Gemini" />
          </Form.Item>
          <Form.Item name="baseUrl" label="Base URL" rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="authType" label="Auth Type">
            <Input placeholder="api_key_header / api_key_query / bearer" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="priority" label="Priority"><InputNumber min={1} /></Form.Item>
            <Form.Item name="weight" label="Weight %"><InputNumber min={0} max={100} /></Form.Item>
            <Form.Item name="timeoutMs" label="Timeout (ms)"><InputNumber min={1000} step={1000} /></Form.Item>
            <Form.Item name="maxRetries" label="Max Retries"><InputNumber min={0} /></Form.Item>
          </Space>
          <Form.Item name="isActive" label="Aktif" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
