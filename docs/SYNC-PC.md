# 🔄 Sync 4IGeneration ke PC (Windows) — `C:\4Igeneration`

Panduan singkat untuk menyiapkan proyek + pipeline LLM 4IG-Finance di komputer
Windows kamu, dan menjaga agar selalu sinkron dengan GitHub.

---

## Prasyarat (install sekali)

1. **Git** — https://git-scm.com/download/win (klik Next terus)
2. **Python 3.11+** — https://www.python.org/downloads/
   ⚠️ **Centang "Add Python to PATH"** saat instalasi (wajib!)
3. Internet stabil (unduhan corpus bisa 1–5 GB)

Cek di CMD:
```bat
git --version
python --version
```

---

## Cara 1 — Paling cepat (CMD sekali jalan)

Buka CMD, lalu:
```bat
git clone -b arena/01a02969-4igeneration https://github.com/andiagilrachman/4IGeneration.git C:\4Igeneration
cd C:\4Igeneration
sync-pc.bat
```
Script akan: checkout branch kerja → buat `.venv` → install dependensi →
menawarkan menjalankan pipeline.

> ⚠️ **Sudah terlanjur clone tanpa `-b`?** (kamu di branch `main` sehingga
> `sync-pc.bat` tidak ada) — cukup jalankan ini di folder yang sudah ada:
> ```bat
> cd C:\4Igeneration
> git fetch origin
> git checkout arena/01a02969-4igeneration
> sync-pc.bat
> ```

## Cara 2 — Sudah pernah clone sebelumnya

Tinggal **double-click `C:\4Igeneration\sync-pc.bat`** — dia otomatis
`git pull` update terbaru + pastikan environment tetap sehat.

## Cara 3 — Dari nol tanpa CMD (bila mau)

1. Buka https://github.com/andiagilrachman/4IGeneration
2. Klik **Code → Download ZIP** → ekstrak ke `C:\4Igeneration`
   (catatan: cara ini tidak otomatis update — lebih baik pakai Cara 1)
3. Buka folder itu → double-click `sync-pc.bat`

---

## Yang dilakukan sync-pc.bat

| Langkah | Aksi |
|---|---|
| 1/5 | Clone atau `git pull` repo ke `C:\4Igeneration` (branch `arena/01a02969-4igeneration`) |
| 2/5 | Buat environment Python `.venv` (sekali saja) |
| 3/5 | Install dependensi (`numpy`, `datasets`, `tokenizers`, `torch`) |
| 4/5 | Cek apakah data tokens sudah ada |
| 5/5 | Tanya: pipeline lengkap (A) / uji cepat (B) / selesai (C) |

Setelah selesai, semua perintah manual dijalankan dari:
```bat
cd C:\4Igeneration\apps\ai-training
```

---

## Langkah pertama yang disarankan di PC-mu

```bat
cd C:\4Igeneration\apps\ai-training
python pipeline.py --steps corpus,build,tokenizer,pack
```
- Mengunduh **6 sumber corpus teks manusia** (Wikipedia ID, FineWeb-2, Aya,
  Cendol, OpenSubtitles, TED — resep WicaraLLM, ±1,3 miliar token)
- Membangun shard → tokenizer BPE → `train.bin`/`val.bin`
- ⏳ Butuh beberapa jam tergantung kecepatan internet (bisa dijalankan
  `--only wikipedia,fineweb2` dulu untuk memulai lebih cepat)

> Jika jaringan memblokir HuggingFace/OPUS (seperti sandbox pengembangan),
> script akan melewati sumber yang gagal dan tetap memakai sumber lain;
> kamu juga bisa menaruh file teks manual (laporan tahunan, artikel) ke
> `apps/ai-training/data/raw_corpus/` lalu jalankan ulang `build`.

## Pretrain di GPU

Setelah data jadi, ikuti **`docs/RUNPOD-PRETRAIN.md`** — sewa GPU RunPod,
upload `data/tokens` + `data/tokenizer` (zip), jalankan 1 perintah train,
download checkpoint ke PC / NAS Synology.

---

## Catatan branch

Pekerjaan LLM ini ada di branch **`arena/01a02969-4igeneration`** (belum di
`main`). `sync-pc.bat` otomatis memakai branch tersebut. Kalau sudah stabil
dan mau dijadikan resmi, merge branch ini ke `main` lewat GitHub (Pull Request).

## Update rutin

Seminggu sekali (atau setelah saya selesaikan tahap baru):
```bat
C:\4Igeneration\sync-pc.bat
```
pilih **C** (tanpa menjalankan pipeline) — kode selalu terbaru.
