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
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { api } from "../lib/api";

interface ProviderLite {
  id: string;
  slug: string;
}

interface KeyRow {
  id: string;
  providerId: string;
  label: string;
  encryptedKey: string;
  status: string;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  provider?: { slug: string };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "success",
  COOLING_DOWN: "warning",
  RATE_LIMITED: "orange",
  DISABLED: "default",
  DEAD: "error",
};

export default function Keys() {
  const [data, setData] = useState<KeyRow[]>([]);
  const [providers, setProviders] = useState<ProviderLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KeyRow | null>(null);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      setData(await api<KeyRow[]>("/admin/provider-keys"));
      setProviders(await api<ProviderLite[]>("/admin/providers"));
    } catch {
      message.error("Gagal memuat keys");
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
    form.setFieldsValue({ status: "ACTIVE", dailyLimit: 1500, monthlyLimit: 45000 });
    setOpen(true);
  }

  function openEdit(k: KeyRow) {
    setEditing(k);
    form.setFieldsValue(k);
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api(`/admin/provider-keys/${editing.id}`, { method: "PUT", body: values });
        message.success("Key diperbarui");
      } else {
        await api("/admin/provider-keys", { method: "POST", body: values });
        message.success("Key dibuat");
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  async function setStatus(k: KeyRow, status: string) {
    try {
      await api(`/admin/provider-keys/${k.id}/status`, { method: "PUT", body: { status } });
      message.success(`Status → ${status}`);
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  async function remove(k: KeyRow) {
    try {
      await api(`/admin/provider-keys/${k.id}`, { method: "DELETE" });
      message.success("Key dihapus");
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Provider Keys Pool
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tambah Key
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: "Label", dataIndex: "label" },
          { title: "Provider", render: (_, k) => k.provider?.slug ?? "-" },
          {
            title: "Key",
            dataIndex: "encryptedKey",
            render: (v: string) => <Typography.Text code>•••{v.slice(-6)}</Typography.Text>,
          },
          {
            title: "Status",
            dataIndex: "status",
            render: (s: string) => <Tag color={STATUS_COLORS[s] ?? "default"}>{s}</Tag>,
          },
          {
            title: "Daily",
            render: (_, k) => `${k.dailyUsed}/${k.dailyLimit}`,
          },
          {
            title: "Monthly",
            render: (_, k) => `${k.monthlyUsed}/${k.monthlyLimit}`,
          },
          {
            title: "Aksi",
            render: (_, k) => (
              <Space wrap>
                <Button size="small" onClick={() => openEdit(k)}>Edit</Button>
                {k.status === "ACTIVE" ? (
                  <Button size="small" onClick={() => setStatus(k, "DISABLED")}>Nonaktifkan</Button>
                ) : (
                  <Button size="small" type="primary" ghost onClick={() => setStatus(k, "ACTIVE")}>Aktifkan</Button>
                )}
                <Popconfirm title="Hapus key ini?" onConfirm={() => remove(k)}>
                  <Button size="small" danger>Hapus</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Edit Key" : "Tambah Key"}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="providerId" label="Provider" rules={[{ required: true }]}>
            <Select
              placeholder="Pilih provider"
              options={providers.map((p) => ({ value: p.id, label: p.slug }))}
            />
          </Form.Item>
          <Form.Item name="label" label="Label" rules={[{ required: true }]}>
            <Input placeholder="gemini-key-1" />
          </Form.Item>
          <Form.Item name="encryptedKey" label="API Key" rules={[{ required: true }]}>
            <Input.Password placeholder="Masukkan API key" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="dailyLimit" label="Daily Limit"><InputNumber min={0} /></Form.Item>
            <Form.Item name="monthlyLimit" label="Monthly Limit"><InputNumber min={0} /></Form.Item>
          </Space>
          <Form.Item name="status" label="Status">
            <Select
              options={["ACTIVE", "COOLING_DOWN", "RATE_LIMITED", "DISABLED", "DEAD"].map((s) => ({
                value: s,
                label: s,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
