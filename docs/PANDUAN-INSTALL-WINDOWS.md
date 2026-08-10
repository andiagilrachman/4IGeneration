# 🪟 PANDUAN INSTALL 4IGENERATION DI KOMPUTER (WINDOWS)

> Cara menjalankan project 4IGeneration v2.0 di PC sendiri pakai XAMPP (MariaDB/MySQL).
> Ikuti urutan ini. Semua perintah tinggal copy-paste ke CMD/PowerShell.

---

## 0. Yang Perlu Disiapkan

| Software | Fungsi | Download |
|---|---|---|
| **XAMPP** (sudah ada ✅) | MariaDB/MySQL untuk database | apachefriends.org |
| **Node.js 20 LTS** | Menjalankan Web (Next.js) & API (NestJS) | nodejs.org |
| **Python 3.11+** | Menjalankan AI Service (FastAPI) | python.org |
| **Git** | Clone project dari GitHub | git-scm.com |
| **pnpm** | Package manager (lebih cepat dari npm) | via npm |

Cek sudah terinstall:
```bat
node -v    :: harus v20.x
python --version   :: harus 3.11+
git --version
```

---

## 1. Install pnpm

```bat
npm install -g pnpm@9
pnpm -v
```

---

## 2. Clone Project

```bat
cd C:\
git clone https://github.com/andiagilrachman/4IGeneration.git
cd 4IGeneration
```

---

## 3. Setup Database (via XAMPP)

1. Buka **XAMPP Control Panel** → Start **MySQL** (Apache tidak wajib).
2. Buka **phpMyAdmin** (http://localhost/phpmyadmin).
3. Klik **New** → buat database bernama `4igeneration` (collation: `utf8mb4_unicode_ci`).
4. Buat user MySQL:
   ```sql
   -- jalankan di tab SQL phpMyAdmin
   CREATE USER '4ig'@'localhost' IDENTIFIED BY '4ig_pass';
   GRANT ALL PRIVILEGES ON 4igeneration.* TO '4ig'@'localhost';
   FLUSH PRIVILEGES;
   ```
   > Jika root XAMPP tidak pakai password, kamu bisa langsung pakai `root` tanpa password
   > (ubah `DATABASE_URL` di langkah 4).

---

## 4. Setup File .env

Salin `.env.example` → `.env` di **root project**, lalu cek baris ini:

```
DATABASE_URL="mysql://4ig:4ig_pass@localhost:3306/4igeneration"
REDIS_URL="redis://localhost:6379"
```

- Jika MySQL tanpa password (user root): `DATABASE_URL="mysql://root:@localhost:3306/4igeneration"`
- Redis di Windows tidak wajib untuk mulai — aplikasi tetap jalan (fallback disk cache).

Buat juga file env per app:
```bat
cd C:\4IGeneration

:: Web
copy apps\web\.env.example apps\web\.env.local

:: Admin
copy apps\admin\.env.example apps\admin\.env.local

:: API
copy apps\api\.env.example apps\api\.env
```
Isi `RESEND_API_KEY`, `MIDTRANS_*` di `apps\api\.env` (opsional, bisa dikosongkan dulu).

---

## 5. Install Dependencies

```bat
cd C:\4IGeneration
pnpm install
```

---

## 6. Migrasi Database + Seed (buat 33 tabel otomatis!)

```bat
cd C:\4IGeneration\apps\api
npx prisma generate
npx prisma migrate deploy
npx ts-node scripts\seed-admin.ts
npx ts-node scripts\seed-plans.ts
```

> ✅ **Ini yang membuat semua tabel database** (users, plans, subscriptions, dll — 33 tabel)
> otomatis terbuat. Tidak perlu buat manual di phpMyAdmin!

---

## 7. Install Python Dependencies (AI Service)

```bat
cd C:\4IGeneration\apps\ai-service
pip install -r requirements.txt
```

---

## 8. Jalankan 4 Aplikasi (4 jendela terminal)

### Terminal 1 — AI Service (port 8000)
```bat
cd C:\4IGeneration\apps\ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Terminal 2 — API (port 3001)
```bat
cd C:\4IGeneration\apps\api
set DATABASE_URL=mysql://4ig:4ig_pass@localhost:3306/4igeneration
set JWT_SECRET=test-secret-4ig
set JWT_REFRESH_SECRET=test-refresh-4ig
set AI_SERVICE_URL=http://localhost:8000
set CORS_ORIGINS=http://localhost:3000,http://localhost:3002
set PORT=3001
npm run start:dev
```

### Terminal 3 — Web (port 3000)
```bat
cd C:\4IGeneration\apps\web
npm run dev
```

### Terminal 4 — Admin Panel (port 3002)
```bat
cd C:\4IGeneration\apps\admin
npm run dev
```

---

## 9. Buka Aplikasi 🎉

| Aplikasi | Alamat |
|---|---|
| 🌐 Website | http://localhost:3000 |
| ⚙️ Admin Panel | http://localhost:3002 |
| 🔌 API | http://localhost:3001/api/v1/health |
| 🧠 AI Service | http://localhost:8000/internal/v1/health |

**Login admin:** `admin@4igeneration.com` / `admin12345`

---

## ⚠️ Troubleshooting

| Masalah | Solusi |
|---|---|
| `Can't reach database server` | Pastikan MySQL XAMPP jalan; cek `DATABASE_URL` |
| Port 3000 dipakai | Ganti: `npm run dev -- -p 3005` |
| AI tidak merespons | AI Service harus jalan duluan (Terminal 1) |
| Redis error | Tidak fatal — aplikasi pakai fallback cache |
| `prisma migrate` error shadow DB | Pastikan user `4ig` punya GRANT ALL (langkah 3.4) |

---

*Dibuat 2026-08-10 · 4IGeneration v2.0 · lihat juga `docs/USAGE.md` untuk detail*
