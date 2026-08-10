"""4IGeneration — Document processor (PDF → teks → chunk).

Ekstrak teks dari PDF laporan keuangan, lalu pecah jadi chunk
dengan overlap agar konteks tidak terpotong. Dipakai fitur RAG Q&A (W21-24).
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

CHUNK_SIZE = 1200  # karakter per chunk
CHUNK_OVERLAP = 200


def extract_text_from_pdf(content: bytes) -> str:
    """Ekstrak teks mentah dari PDF (pypdf)."""
    from io import BytesIO

    from pypdf import PdfReader

    reader = PdfReader(BytesIO(content))
    pages: list[str] = []
    for page in reader.pages:
        try:
            pages.append(page.extract_text() or "")
        except Exception as exc:  # noqa: BLE001
            logger.warning("Gagal ekstrak halaman: %s", exc)
    return "\n\n".join(pages)


def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Pecah teks jadi chunk dengan overlap. Kosongkan baris yang terlalu pendek."""
    text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if len(text) <= size:
        return [text] if text.strip() else []

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        # coba patah di akhir kalimat
        if end < len(text):
            cut = text.rfind(". ", start + size // 2, end)
            if cut != -1:
                end = cut + 1
        chunks.append(text[start:end].strip())
        start = max(end - overlap, start + 1)
        if start >= len(text):
            break
    return [c for c in chunks if c]


def process_pdf(filename: str, content: bytes) -> dict[str, Any]:
    """Proses PDF → {text, chunks, pages_info}. Raise bila PDF tidak valid."""
    text = extract_text_from_pdf(content)
    if not text or len(text.strip()) < 50:
        raise ValueError("PDF kosong atau tidak bisa dibaca — pastikan file laporan keuangan valid")
    chunks = chunk_text(text)
    if not chunks:
        raise ValueError("Tidak ada teks yang bisa diproses dari PDF ini")
    return {
        "filename": filename,
        "char_count": len(text),
        "chunk_count": len(chunks),
        "chunks": chunks,
    }
