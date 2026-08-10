/**
 * Konten Blog 4IGeneration — artikel edukasi investasi (W35-36 Marketing site).
 * Data statis di-render server-side (SSG) untuk SEO.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readMinutes: number;
  author: string;
  tags: string[];
  content: string[]; // paragraf (mendukung markdown ringan: **bold**, - list)
}

export const blogPosts: BlogPost[] = [
  {
    slug: "panduan-screener-saham-idx-pemula",
    title: "Panduan Screener Saham IDX untuk Pemula: Temukan Emiten Berkualitas",
    excerpt:
      "Belajar memakai screener fundamental untuk menyaring 28+ saham likuid IDX secara cepat — dari rasio P/E, ROE, hingga margin laba.",
    date: "2026-08-05",
    category: "Panduan",
    readMinutes: 6,
    author: "Tim 4IGeneration",
    tags: ["screener", "fundamental", "IDX", "pemula"],
    content: [
      "Screener saham adalah alat yang menyaring ribuan emiten berdasarkan kriteria tertentu — mirip filter di aplikasi belanja, tapi untuk pasar modal. Dengan screener, Anda tidak perlu membaca satu per satu laporan keuangan secara manual.",
      "**Apa itu rasio fundamental penting?**",
      "- **P/E (Price to Earnings):** harga saham dibanding laba per saham. Semakin rendah relatif ke sektor, umumnya semakin murah.",
      "- **ROE (Return on Equity):** kemampuan perusahaan menghasilkan laba dari modal pemegang saham. ROE > 15% bertahun-tahun adalah tanda bagus.",
      "- **Revenue Growth:** pertumbuhan pendapatan tahunan. Konsistensi pertumbuhan menandakan bisnis yang berkembang.",
      "- **Profit Margin:** persentase laba bersih dari pendapatan. Margin tinggi menandakan daya saing.",
      "Di 4IGeneration, Anda cukup mengisi filter (sektor, P/E maksimum, ROE minimum), dan sistem akan menampilkan emiten yang cocok lengkap dengan skor kualitas — lalu AI merangkum kandidat terbaiknya.",
      "**Tips pemula:** mulailah dengan filter longgar (misal ROE > 10%) lalu perketat bertahap. Jangan hanya mengejar P/E rendah — pastikan fundamental lain sehat dan hindari keputusan tanpa riset lanjutan.",
      "Ingat: screener adalah alat penyaring awal, bukan rekomendasi beli. Selalu lakukan analisis lebih dalam dan pertimbangkan profil risiko Anda.",
    ],
  },
  {
    slug: "analisis-fundamental-vs-teknikal",
    title: "Analisis Fundamental vs Teknikal: Mana yang Tepat untuk Anda?",
    excerpt:
      "Dua aliran besar analisis saham punya kelebihan masing-masing. Kenali perbedaannya dan kapan menggunakannya.",
    date: "2026-07-28",
    category: "Edukasi",
    readMinutes: 5,
    author: "Tim 4IGeneration",
    tags: ["fundamental", "teknikal", "analisis"],
    content: [
      "Analisis fundamental menilai nilai intrinsik perusahaan lewat laporan keuangan, industri, dan ekonomi makro. Analisis teknikal membaca pergerakan harga dan volume untuk menemukan pola. Keduanya bukan musuh — justru saling melengkapi.",
      "**Kapan pakai fundamental?**",
      "- Investasi jangka menengah–panjang (6 bulan ke atas)",
      "- Menentukan emiten berkualitas yang layak dikoleksi",
      "- Saat valuasi pasar sedang murah (buy the dip dengan dasar kuat)",
      "**Kapan pakai teknikal?**",
      "- Trading jangka pendek (hari–minggu)",
      "- Mencari timing entry/exit yang lebih presisi",
      "- Mengelola risiko lewat support/resistance dan stop loss",
      "Platform 4IGeneration menggabungkan keduanya: AI membaca data fundamental emiten IDX, lalu menyajikan ringkasan yang mudah dipahami — termasuk konteks sektor dan sentimen berita terkini.",
      "Saran kami: tentukan dulu gaya Anda (investor atau trader), lalu gunakan alat yang sesuai. Data yang sama bisa dibaca berbeda — yang penting konsisten dengan strategi dan toleransi risiko Anda.",
    ],
  },
  {
    slug: "membaca-laporan-keuangan-dengan-ai",
    title: "Cara Membaca Laporan Keuangan Lebih Cepat dengan AI (RAG)",
    excerpt:
      "Upload PDF laporan tahunan lalu tanyakan langsung: berapa laba bersih, ROE, atau rasio utangnya. Begini caranya.",
    date: "2026-07-20",
    category: "Fitur",
    readMinutes: 4,
    author: "Tim 4IGeneration",
    tags: ["RAG", "AI", "laporan keuangan", "PDF"],
    content: [
      "Laporan tahunan (annual report) bisa ratusan halaman. Membacanya manual memakan waktu berjam-jam. Fitur RAG (Retrieval-Augmented Generation) di 4IGeneration memotong waktu itu menjadi hitungan menit.",
      "**Cara kerjanya:** Anda mengunggah PDF laporan → sistem memecah halaman menjadi bagian-bagian kecil → disimpan di basis data vektor → setiap pertanyaan Anda dijawab AI dengan mengacu langsung ke isi dokumen tersebut (bukan jawaban umum).",
      "**Contoh pertanyaan yang bisa diajukan:**",
      "- \"Berapa laba bersih perusahaan ini pada tahun terakhir?\"",
      "- \"Apa rasio ROE dan bagaimana trennya 3 tahun terakhir?\"",
      "- \"Berapa total utang dan apakah ada risiko likuiditas?\"",
      "- \"Apa segmen bisnis dengan pendapatan terbesar?\"",
      "Kelebihan utama: jawaban menyertakan konteks dari dokumen asli, sehingga Anda bisa menelusuri ulang sumbernya. Ini mengurangi risiko 'AI halusinasi' karena model dipaksa menjawab berdasarkan dokumen yang Anda unggah.",
      "Gunakan fitur ini untuk laporan keuangan, prospektus IPO, atau riset analis — dan padukan dengan analisis emiten otomatis untuk gambaran menyeluruh.",
    ],
  },
  {
    slug: "strategi-pantau-watchlist-saham",
    title: "Bangun Watchlist Saham yang Efektif dengan Pendekatan Sistematis",
    excerpt:
      "Watchlist bukan sekadar daftar saham. Pelajari cara menyusunnya berdasarkan sektor, likuiditas, dan target valuasi.",
    date: "2026-07-12",
    category: "Strategi",
    readMinutes: 5,
    author: "Tim 4IGeneration",
    tags: ["watchlist", "strategi", "portofolio"],
    content: [
      "Watchlist yang baik adalah daftar saham yang sudah Anda riset dan menunggu momentum terbaik untuk dibeli — bukan kumpulan 'saham yang lagi ramai'.",
      "**Langkah menyusun watchlist sistematis:**",
      "1. **Mulai dari sektor:** pilih 3–5 sektor yang Anda pahami (bank, konsumer, energi, dll).",
      "2. **Saring dengan kriteria:** gunakan screener untuk menyaring emiten dengan fundamental sehat.",
      "3. **Riset mendalam:** baca laporan keuangan (bisa dengan fitur RAG) dan bandingkan valuasinya.",
      "4. **Tentukan titik masuk:** catat harga wajar dan level support yang Anda targetkan.",
      "5. **Pantau & evaluasi:** update watchlist secara berkala; buang yang fundamentalnya memburuk.",
      "Di 4IGeneration, fitur Watchlist memungkinkan Anda menyimpan emiten favorit dan Compare untuk membandingkan 2–5 saham sekaligus — lengkap dengan ringkasan AI.",
      "Disiplin adalah kuncinya. Watchlist membantu Anda tidak impulsif: ketika harga turun ke area target, Anda sudah tahu alasannya — bukan karena panik.",
    ],
  },
  {
    slug: "apa-itu-market-recap-kenapa-penting",
    title: "Apa Itu Market Recap dan Mengapa Investor Perlu Membacanya Setiap Hari?",
    excerpt:
      "Ringkasan pasar harian yang menggabungkan berita, pergerakan indeks, dan sentimen AI — dalam satu bacaan singkat.",
    date: "2026-07-05",
    category: "Edukasi",
    readMinutes: 4,
    author: "Tim 4IGeneration",
    tags: ["market recap", "berita", "sentimen"],
    content: [
      "Pasar bergerak karena kombinasi berita, data ekonomi, dan psikologi pelaku pasar. Market recap merangkum semuanya menjadi bacaan singkat agar Anda tetap update tanpa harus memantau layar sepanjang hari.",
      "**Yang biasanya ada di market recap:**",
      "- Pergerakan IHSG dan indeks sektoral",
      "- Berita makro dan korporasi yang relevan",
      "- Sentimen pasar: apakah pelaku cenderung risk-on atau risk-off",
      "- Ringkasan AI tentang implikasi bagi investor",
      "Fitur Market Recap di 4IGeneration mengumpulkan berita dari sumber tepercaya, memproses sentimennya dengan AI, lalu menyusun ringkasan harian yang otomatis dikirim ke email Anda (jika diaktifkan).",
      "Kebiasaan membaca recap 5–10 menit setiap pagi membantu Anda mendeteksi perubahan tren lebih awal dan membuat keputusan berdasarkan informasi — bukan rumor.",
      "Ingat: recap adalah peta, bukan kendaraan. Tetap lakukan analisis sendiri sebelum mengambil keputusan investasi.",
    ],
  },
  {
    slug: "mengenal-api-key-dan-integrasi",
    title: "Mengenal API Key 4IGeneration: Integrasi Analisis AI ke Aplikasi Anda",
    excerpt:
      "Untuk developer & fintech: cara membuat API key, endpoint publik yang tersedia, dan contoh integrasi dengan SDK.",
    date: "2026-06-28",
    category: "Developer",
    readMinutes: 7,
    author: "Tim 4IGeneration",
    tags: ["API", "developer", "SDK", "integrasi"],
    content: [
      "4IGeneration bukan hanya aplikasi web — ia juga platform API. Dengan API key, Anda bisa memanggil analisis AI saham langsung dari aplikasi, bot, atau sistem internal Anda.",
      "**Cara memulai:**",
      "1. Login ke dashboard → buka halaman API Keys → buat key baru (format `4IG_xxxxxxxx_xxxxxxxx`).",
      "2. Key dipakai sebagai header `X-API-Key` pada setiap request.",
      "3. Setiap key punya rate limit dan tercatat pemakaiannya — kelola di halaman yang sama.",
      "**Endpoint publik yang tersedia:**",
      "- `GET /public/stocks` — daftar saham IDX",
      "- `GET /public/stocks/:ticker` — data fundamental satu saham",
      "- `POST /public/analysis/screener` — screening otomatis",
      "- `POST /public/analysis/stock` — analisis AI satu emiten",
      "**SDK resmi:** tersedia untuk JavaScript/TypeScript (`@4ig/sdk-js`) dan Python — tinggal install dan panggil fungsinya, tanpa repot menulis HTTP client.",
      "Kami menyediakan dokumentasi lengkap di halaman /docs dengan contoh curl, JavaScript, dan Python. Mulai dari skala kecil — kunci API Anda siap naik kelas kapan pun.",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Render konten blog (mendukung **bold** dan baris - list). */
export function renderParagraph(para: string): { text: string; list?: boolean; bold?: boolean }[] {
  // tidak dipakai untuk render penuh — helper sederhana
  return [{ text: para }];
}
