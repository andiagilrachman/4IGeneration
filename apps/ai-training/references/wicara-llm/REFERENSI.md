# Referensi: WicaraLLM (Apache-2.0)

Folder ini berisi salinan repo **WicaraLLM** — *"Indonesian Small Language Model
(56M) built from scratch on a single 6 GB laptop GPU"* oleh
[bagusardin25](https://github.com/bagusardin25/WicaraLLM).

- Lisensi: **Apache-2.0** (lihat `LICENSE`)
- Sumber: https://github.com/bagusardin25/WicaraLLM
- Tanggal disalin: 2026-08-22

## Kenapa kita simpan

Proyek ini adalah **referensi implementasi** untuk Tahap 2–4 (tokenizer,
arsitektur, training loop) — persis pola yang kita pakai: model dari nol,
GPU kecil, korpus 1.3B token bahasa Indonesia. Semua komponen (RMSNorm, RoPE,
GQA, SwiGLU, KV-cache, training loop) ditulis manual dengan PyTorch.

## Resep korpus 1.3B token (dari `data/raw/manifest.json` + `data/raw/SOURCES.md`)

| Sumber | Peran | Porsi | Lisensi | Lokasi |
|---|---|---|---|---|
| OpenSubtitles v2024 (id) | Dialog percakapan | 40% (520M) | opus.nlpl.eu | `object.pouta.csc.fi/OPUS-OpenSubtitles/v2024/mono/id.txt.gz` |
| FineWeb-2 (ind_Latn) | Ragam web informal | 20% (260M) | ODC-BY 1.0 | HuggingFace `HuggingFaceFW/fineweb-2` |
| Wikipedia id (dump 2023-11-01) | Faktual formal | 15% (195M) | CC-BY-SA | HuggingFace `wikimedia/wikipedia` |
| Aya Collection (id) | Instruksi anotasi manusia | 12% (156M) | Apache-2.0 | HuggingFace `CohereLabs/aya_collection_language_split` |
| Cendol Collection v2 | Instruksi ID & daerah | 12% (156M) | Apache-2.0 | HuggingFace `indonlp/cendol_collection_v2` |
| TED2020 (id) | Transkrip pidato | 1% (13M) | CC-BY-NC-ND | `object.pouta.csc.fi/OPUS-TED2020/v1/mono/id.txt.gz` |

> Semua sumber = **teks manusia** (subtitle, wiki, transkrip, anotasi manusia) —
> sesuai Prinsip Data kita. Catatan: WicaraLLM menyertakan `make_synthetic_data.py`
> untuk tahap SFT; kita **tidak** memakai pendekatan sintetis LLM itu.

## Apa yang kita adaptasi (Tahap 2–4)

- `scripts/train_tokenizer.py` + `scripts/pack_tokens.py` → tokenizer BPE + packing
- `src/model/` (config, attention, ffn, rmsnorm, rope) → arsitektur 300M
- `scripts/train.py` → training loop pretrain
- `scripts/clean_corpus.py` + `src/data/` → pipeline pembersihan korpus

Adaptasi wajib mencantumkan atribusi Apache-2.0 di header file yang diturunkan.
