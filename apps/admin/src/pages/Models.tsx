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

interface ProviderLite {
  id: string;
  slug: string;
  name: string;
}

interface Model {
  id: string;
  providerId: string;
  modelId: string;
  alias: string;
  contextWindow: number;
  priceInput: number;
  priceOutput: number;
  isActive: boolean;
  provider?: { slug: string };
}

export default function Models() {
  const [data, setData] = useState<Model[]>([]);
  const [providers, setProviders] = useState<ProviderLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      setData(await api<Model[]>("/admin/models"));
      setProviders(await api<ProviderLite[]>("/admin/providers"));
    } catch {
      message.error("Gagal memuat models");
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
    form.setFieldsValue({ contextWindow: 128000, priceInput: 0, priceOutput: 0, isActive: true });
    setOpen(true);
  }

  function openEdit(m: Model) {
    setEditing(m);
    form.setFieldsValue(m);
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api(`/admin/models/${editing.id}`, { method: "PUT", body: values });
        message.success("Model diperbarui");
      } else {
        await api("/admin/models", { method: "POST", body: values });
        message.success("Model dibuat");
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  async function remove(m: Model) {
    try {
      await api(`/admin/models/${m.id}`, { method: "DELETE" });
      message.success("Model dihapus");
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          AI Models
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tambah Model
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: "Alias", dataIndex: "alias", render: (a: string) => <Tag color="cyan">{a}</Tag> },
          { title: "Model ID", dataIndex: "modelId" },
          { title: "Provider", render: (_, m) => m.provider?.slug ?? "-" },
          { title: "Context", dataIndex: "contextWindow" },
          { title: "Harga Input/1K", dataIndex: "priceInput" },
          { title: "Harga Output/1K", dataIndex: "priceOutput" },
          {
            title: "Aktif",
            dataIndex: "isActive",
            render: (v: boolean) => (v ? <Tag color="success">AKTIF</Tag> : <Tag>NONAKTIF</Tag>),
          },
          {
            title: "Aksi",
            render: (_, m) => (
              <Space>
                <Button size="small" onClick={() => openEdit(m)}>Edit</Button>
                <Popconfirm title="Hapus model ini?" onConfirm={() => remove(m)}>
                  <Button size="small" danger>Hapus</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Edit Model" : "Tambah Model"}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="providerId" label="Provider" rules={[{ required: true }]}>
            <Select
              placeholder="Pilih provider"
              options={providers.map((p) => ({ value: p.id, label: `${p.slug} — ${p.name}` }))}
            />
          </Form.Item>
          <Form.Item name="modelId" label="Model ID" rules={[{ required: true }]}>
            <Input placeholder="gemini-flash-latest" />
          </Form.Item>
          <Form.Item name="alias" label="Alias (4IG-*)" rules={[{ required: true }]}>
            <Input placeholder="4IG-Small" />
          </Form.Item>
          <Space size="large">
            <Form.Item name="contextWindow" label="Context Window"><InputNumber min={1} /></Form.Item>
            <Form.Item name="priceInput" label="Harga Input/1K"><InputNumber min={0} step={0.00001} /></Form.Item>
            <Form.Item name="priceOutput" label="Harga Output/1K"><InputNumber min={0} step={0.00001} /></Form.Item>
          </Space>
          <Form.Item name="isActive" label="Aktif" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
