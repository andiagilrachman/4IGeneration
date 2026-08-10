import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { createHash } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * PaymentsService — integrasi Midtrans Snap (W17-18).
 *
 * Alur:
 * 1. POST /payments/create (planSlug) → buat Payment PENDING + minta snap_token ke Midtrans
 * 2. Client buka Snap popup (client key) → user bayar (sandbox: kartu test)
 * 3. Midtrans kirim notifikasi ke /payments/webhook/midtrans (server-to-server)
 * 4. Webhook: verifikasi signature → status settlement → Payment PAID + aktivasi
 *    subscription + alokasi kredit bulanan + buat Invoice
 *
 * Referensi blueprint:
 * - BAGIAN 8.4: POST /payments/create, GET /payments, GET /payments/:id,
 *   POST /payments/webhook/midtrans, GET /invoices
 * - W17-18 roadmap: Midtrans integration
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly isProduction =
    (process.env.MIDTRANS_IS_PRODUCTION ?? "false").toLowerCase() === "true";
  private readonly snapBaseUrl = this.isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  private readonly serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";

  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // CREATE PAYMENT (Snap)
  // ------------------------------------------------------------------
  async create(userId: string, planSlug: string) {
    const plan = await this.prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan || !plan.isActive) throw new NotFoundException("Plan tidak ditemukan");
    if (!this.serverKey) throw new BadRequestException("Midtrans belum dikonfigurasi");

    // order_id unik
    const orderId = `4IG-${Date.now()}-${userId.slice(0, 8)}`;
    const gross = Number(plan.priceMonthly);
    if (gross <= 0) throw new BadRequestException("Plan gratis tidak perlu pembayaran");

    // simpan Payment PENDING
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: gross,
        currency: plan.currency,
        status: "PENDING",
        gateway: "midtrans",
        gatewayRef: orderId,
        metadata: { planSlug: plan.slug, planName: plan.name },
      },
    });

    // minta snap_token ke Midtrans
    const body = {
      transaction_details: { order_id: orderId, gross_amount: gross },
      item_details: [
        {
          id: plan.slug,
          price: gross,
          quantity: 1,
          name: `Langganan ${plan.name} — 1 bulan`,
        },
      ],
      customer_details: { email: (await this.prisma.user.findUnique({ where: { id: userId } }))?.email },
      credit_card: { secure: true },
    };

    const auth = `Basic ${Buffer.from(`${this.serverKey}:`).toString("base64")}`;
    const res = await fetch(this.snapBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      this.logger.error(`Midtrans error ${res.status}: ${await res.text()}`);
      throw new BadRequestException("Gagal membuat pembayaran di Midtrans");
    }

    const snap = (await res.json()) as { token: string; redirect_url: string };

    return {
      paymentId: payment.id,
      orderId,
      snapToken: snap.token,
      redirectUrl: snap.redirect_url,
      amount: gross,
      plan: { slug: plan.slug, name: plan.name },
    };
  }

  // ------------------------------------------------------------------
  // LIST & DETAIL
  // ------------------------------------------------------------------
  async list(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { invoice: true },
    });
  }

  async detail(userId: string, id: string) {
    const p = await this.prisma.payment.findFirst({ where: { id, userId }, include: { invoice: true } });
    if (!p) throw new NotFoundException("Pembayaran tidak ditemukan");
    return p;
  }

  // ------------------------------------------------------------------
  // WEBHOOK (Midtrans → server)
  // ------------------------------------------------------------------
  /**
   * Proses notifikasi Midtrans. Payload asli dari Midtrans berisi:
   * { order_id, status_code, gross_amount, signature_key, transaction_status, ... }
   * Verifikasi signature: SHA512(order_id + status_code + gross_amount + ServerKey)
   */
  async handleWebhook(payload: Record<string, unknown>) {
    const orderId = String(payload.order_id ?? "");
    const statusCode = String(payload.status_code ?? "");
    const grossAmount = String(payload.gross_amount ?? "");
    const signatureKey = String(payload.signature_key ?? "");
    const transactionStatus = String(payload.transaction_status ?? "");

    // 1) verifikasi signature (keamanan — jangan percaya payload mentah)
    const expectedSig = createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${this.serverKey}`)
      .digest("hex");
    if (expectedSig !== signatureKey) {
      this.logger.warn(`Webhook signature tidak cocok untuk ${orderId}`);
      throw new BadRequestException("Invalid signature");
    }

    // 2) cari payment by gatewayRef (order_id)
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayRef: orderId },
      include: { user: true },
    });
    if (!payment) {
      this.logger.warn(`Payment ${orderId} tidak ditemukan`);
      throw new NotFoundException("Payment tidak ditemukan");
    }

    // 3) proses status
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      if (payment.status !== "PAID") {
        await this.#markPaid(payment.id, orderId);
      }
    } else if (transactionStatus === "pending") {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: "PENDING" } });
    } else if (["deny", "cancel", "expire", "failure"].includes(transactionStatus)) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    }

    return { received: true, orderId, status: transactionStatus };
  }

  // ------------------------------------------------------------------
  // INTERNAL
  // ------------------------------------------------------------------
  async #markPaid(paymentId: string, orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId }, include: { user: true } });
    if (!payment) return;

    // 1) Payment → PAID
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", paidAt: new Date() },
    });

    // 2) aktivasi subscription + alokasi kredit bulanan
    const planSlug = (payment.metadata as { planSlug?: string } | null)?.planSlug;
    if (planSlug) {
      const plan = await this.prisma.plan.findUnique({ where: { slug: planSlug } });
      if (plan) {
        await this.prisma.subscription.updateMany({
          where: { userId: payment.userId, status: { in: ["ACTIVE", "TRIALING"] } },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
        const now = new Date();
        const endsAt = new Date(now);
        endsAt.setMonth(endsAt.getMonth() + 1);
        await this.prisma.subscription.create({
          data: {
            userId: payment.userId,
            planId: plan.id,
            status: "ACTIVE",
            startsAt: now,
            endsAt,
          },
        });
        // alokasi kredit
        if (plan.creditsPerMonth > 0) {
          const credit = await this.prisma.credit.upsert({
            where: { userId: payment.userId },
            create: { userId: payment.userId, balance: plan.creditsPerMonth },
            update: { balance: { increment: plan.creditsPerMonth } },
          });
          await this.prisma.creditTransaction.create({
            data: {
              creditId: credit.id,
              type: "PURCHASE",
              amount: plan.creditsPerMonth,
              description: `Kredit bulanan — ${plan.name} (pembayaran ${orderId})`,
            },
          });
        }
      }
    }

    // 3) buat Invoice
    const invoiceNumber = `INV-${Date.now()}`;
    await this.prisma.invoice.create({
      data: {
        paymentId,
        number: invoiceNumber,
        amount: payment.amount,
        currency: payment.currency,
        status: "PAID",
        dueDate: new Date(),
      },
    });

    this.logger.log(`Payment ${orderId} PAID — subscription & invoice dibuat`);
  }
}
