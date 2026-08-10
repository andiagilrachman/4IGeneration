import { Injectable, Logger } from "@nestjs/common";

/**
 * EmailService — kirim email via Resend (W19-20 + integrasi lanjutan).
 * Tanpa key / gagal → log saja (jangan blokir fitur utama).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey = process.env.RESEND_API_KEY ?? "";
  private readonly from = process.env.RESEND_FROM_EMAIL ?? "4IGeneration <onboarding@resend.dev>";
  private readonly apiUrl = "https://api.resend.com/emails";

  get enabled(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Kirim email. Mengembalikan { sent, id } — sent=false bila gagal/tanpa key.
   */
  async send(to: string, subject: string, html: string): Promise<{ sent: boolean; id?: string }> {
    if (!this.apiKey) {
      this.logger.warn("RESEND_API_KEY belum diatur — email tidak dikirim");
      return { sent: false };
    }
    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: this.from, to: [to], subject, html }),
      });
      if (!res.ok) {
        this.logger.error(`Resend error ${res.status}: ${await res.text()}`);
        return { sent: false };
      }
      const data = (await res.json()) as { id: string };
      this.logger.log(`Email terkirim ke ${to} (${data.id})`);
      return { sent: true, id: data.id };
    } catch (err) {
      this.logger.error(`Gagal kirim email: ${(err as Error).message}`);
      return { sent: false };
    }
  }

  /** Email market recap harian. */
  async sendMarketRecap(to: string, recap: string, date: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #0f1424; color: #f8fafc; border-radius: 16px;">
        <h2 style="color: #a78bfa;">📰 Market Recap — ${date}</h2>
        <div style="white-space: pre-wrap; line-height: 1.6;">${recap
          .replace(/\n/g, "<br/>")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          ⚖️ Disclaimer: alat analisis edukatif, bukan rekomendasi investasi.<br/>
          © 4IGeneration
        </p>
      </div>`;
    return this.send(to, `Market Recap ${date} — 4IGeneration`, html);
  }
}
