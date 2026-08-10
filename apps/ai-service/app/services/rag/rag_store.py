"""4IGeneration — RAG store (ChromaDB + Gemini embedding).

Menyimpan dokumen laporan keuangan (PDF) sebagai vektor, untuk fitur
Q&A (W21-24): tanya jawab dengan AI berdasarkan isi dokumen.

Referensi blueprint:
- BAGIAN 3: Vector DB ChromaDB (later Qdrant)
- W21-22 roadmap: RAG — vector database, document processing, embedding, retrieval
- W23-24 roadmap: Chat interface
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# ChromaDB persistent path (workspace-relative, tidak ter-commit)
DATA_DIR = Path(os.environ.get("RAG_DATA_DIR", ".rag_data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)

CHROMA_PATH = str(DATA_DIR / "chroma")
DOCS_INDEX = DATA_DIR / "documents.json"

EMBED_MODEL = "gemini-embedding-001"


def _gemini_key() -> str:
    """Ambil Gemini key — prioritas env, fallback ke config (yang load .env)."""
    key = os.environ.get("GEMINI_API_KEY", "")
    if key:
        return key
    try:
        from app.core.config import get_settings

        return get_settings().gemini_api_key
    except Exception:  # noqa: BLE001
        return ""


def embed_text(text: str) -> list[float]:
    """Embedding satu teks via Gemini API."""
    import urllib.request

    key = _gemini_key()
    if not key:
        raise RuntimeError("GEMINI_API_KEY belum dikonfigurasi untuk embedding")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{EMBED_MODEL}:embedContent?key={key}"
    body = json.dumps({"content": {"parts": [{"text": text[:4000]}]}}).encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read())
    except urllib.error.HTTPError as exc:
        logger.error("Gemini embed %s: %s", exc.code, exc.read().decode()[:300])
        raise
    return d.get("embedding", {}).get("values", [])


class GeminiEmbeddingFunction:
    """Adaptor embedding untuk ChromaDB (kompatibel ChromaDB 1.x)."""

    def name(self) -> str:
        return f"gemini-{EMBED_MODEL}"

    def __call__(self, input: list[str]) -> list[list[float]]:
        return [embed_text(t) for t in input]

    def embed_documents(self, input: list[str]) -> list[list[float]]:
        return self(input)

    def embed_query(self, input) -> list[list[float]]:
        # ChromaDB 1.x: embed_query harus mengembalikan list berisi 1 vektor
        if isinstance(input, (list, tuple)):
            if not input:
                return [[]]
            text = str(input[0])
        else:
            text = str(input)
        return [embed_text(text)]


def get_collection():
    import chromadb

    client = chromadb.PersistentClient(path=CHROMA_PATH)
    return client.get_or_create_collection(
        name="financial_docs",
        embedding_function=GeminiEmbeddingFunction(),
        metadata={"hnsw:space": "cosine"},
    )


def _load_index() -> dict[str, Any]:
    if DOCS_INDEX.exists():
        try:
            return json.loads(DOCS_INDEX.read_text())
        except json.JSONDecodeError:
            pass
    return {"documents": {}}


def _save_index(index: dict[str, Any]) -> None:
    DOCS_INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2))


def add_document(
    filename: str,
    chunks: list[str],
    metadata: dict[str, Any] | None = None,
) -> str:
    """Simpan dokumen + chunk-nya ke ChromaDB. Mengembalikan doc_id."""
    doc_id = str(uuid.uuid4())
    meta = metadata or {}
    meta.update({"filename": filename, "doc_id": doc_id})

    collection = get_collection()
    ids = [f"{doc_id}-{i}" for i in range(len(chunks))]
    collection.add(
        ids=ids,
        documents=chunks,
        metadatas=[{**meta, "chunk_index": i} for i in range(len(chunks))],
    )

    index = _load_index()
    index["documents"][doc_id] = {
        "id": doc_id,
        "filename": filename,
        "chunks": len(chunks),
        "created_at": __import__("datetime").datetime.now().isoformat(),
        "metadata": meta,
    }
    _save_index(index)

    logger.info("Dokumen %s disimpan (%d chunk)", filename, len(chunks))
    return doc_id


def list_documents() -> list[dict[str, Any]]:
    index = _load_index()
    return list(index["documents"].values())


def delete_document(doc_id: str) -> bool:
    collection = get_collection()
    # hapus chunk milik doc
    try:
        collection.delete(where={"doc_id": doc_id})
    except Exception as exc:  # noqa: BLE001
        logger.warning("Gagal hapus chunk: %s", exc)
    index = _load_index()
    if doc_id in index["documents"]:
        del index["documents"][doc_id]
        _save_index(index)
        return True
    return False


def retrieve(question: str, n_results: int = 4) -> list[dict[str, Any]]:
    """Cari chunk paling relevan untuk pertanyaan."""
    collection = get_collection()
    results = collection.query(query_texts=[question], n_results=n_results)
    out: list[dict[str, Any]] = []
    if results and results.get("documents") and results["documents"][0]:
        docs = results["documents"][0]
        metas = results.get("metadatas", [[]])[0] or [{}] * len(docs)
        dists = results.get("distances", [[]])[0] or [0.0] * len(docs)
        for text, m, d in zip(docs, metas, dists):
            out.append(
                {
                    "text": text,
                    "filename": m.get("filename", "?"),
                    "doc_id": m.get("doc_id", ""),
                    "chunk_index": m.get("chunk_index", 0),
                    "distance": round(float(d), 4),
                }
            )
    return out


def stats() -> dict[str, Any]:
    try:
        collection = get_collection()
        count = collection.count()
    except Exception:  # noqa: BLE001
        count = 0
    return {"collection": "financial_docs", "chunks": count, "documents": len(list_documents())}
