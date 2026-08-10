import { Injectable, Logger } from "@nestjs/common";

/**
 * RagService — proxy ke FastAPI untuk RAG Q&A (W21-24).
 * Upload PDF, daftar dokumen, tanya jawab, hapus dokumen.
 */
@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly baseUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

  private async proxyJson<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}/internal/v1${path}`, init);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`AI Service error ${res.status}: ${body.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }

  async listDocuments() {
    const data = await this.proxyJson<{ success: boolean; data: unknown }>("/rag/documents");
    return data.data;
  }

  async uploadPdf(file: Express.Multer.File) {
    const form = new FormData();
    const buf = new Uint8Array(file.buffer);
    form.append(
      "file",
      new Blob([buf as unknown as BlobPart], { type: "application/pdf" }),
      file.originalname,
    );
    const data = await this.proxyJson<{ success: boolean; data: unknown }>("/rag/upload", {
      method: "POST",
      body: form,
    });
    return data.data;
  }

  async ask(question: string, docId?: string) {
    const data = await this.proxyJson<{ success: boolean; data: unknown }>("/rag/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, doc_id: docId }),
    });
    return data.data;
  }

  async deleteDocument(docId: string) {
    const data = await this.proxyJson<{ success: boolean; data: unknown }>(
      `/rag/documents/${docId}`,
      { method: "DELETE" },
    );
    return data.data;
  }
}
