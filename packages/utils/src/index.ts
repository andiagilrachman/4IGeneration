/** 4IGeneration — utilitas umum tanpa dependensi eksternal. */

/** Gabung class dengan kondisi (ringan, tanpa clsx). */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}

/** Format angka ke format Indonesia, mis. 1250000 -> Rp 1.250.000 */
export function formatIDR(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

/** Format tanggal ISO ke format lokal. */
export function formatDate(iso: string | Date, locale = "id-ID"): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

/** Clamp angka ke rentang. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Tanda arah perubahan harga (bullish/bearish/neutral). */
export function priceDirection(current: number, previous: number): "bullish" | "bearish" | "neutral" {
  if (current > previous) return "bullish";
  if (current < previous) return "bearish";
  return "neutral";
}

/** Sleep (untuk demo/stub). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
