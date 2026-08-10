"""RAG Q&A endpoints (W21-24) — tanya jawab dengan dokumen laporan keuangan.

- POST /rag/upload     → upload PDF (multipart), proses & simpan ke ChromaDB
- GET  /rag/documents  → daftar dokumen
- POST /rag/ask        → tanya jawab: retrieve chunk relevan → AI jawab dengan konteks
- DELETE /rag/documents/:id → hapus dokumen
"""

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.services.ai.gateway import get_gateway
from app.services.rag import rag_store
from app.services.rag.document_processor import process_pdf

router = APIRouter()


@router.post("/rag/upload")
async def upload_document(file: UploadFile = File(...)) -> dict:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya file PDF yang didukung")
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File maksimal 20MB")

    try:
        processed = process_pdf(file.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    doc_id = rag_store.add_document(
        filename=file.filename,
        chunks=processed["chunks"],
        metadata={"char_count": processed["char_count"]},
    )

    return {
        "success": True,
        "data": {
            "doc_id": doc_id,
            "filename": file.filename,
            "chunks": processed["chunk_count"],
            "chars": processed["char_count"],
        },
    }


@router.get("/rag/documents")
async def list_documents() -> dict:
    return {"success": True, "data": rag_store.list_documents()}


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    doc_id: str | None = None  # batasi ke satu dokumen (opsional)
    n_results: int = 4


@router.post("/rag/ask")
async def ask(req: AskRequest) -> dict:
    # 1) retrieve chunk relevan
    if req.doc_id:
        all_chunks = rag_store.retrieve(req.question, n_results=20)
        chunks = [c for c in all_chunks if c["doc_id"] == req.doc_id][: req.n_results]
    else:
        chunks = rag_store.retrieve(req.question, n_results=req.n_results)

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="Tidak ada dokumen yang relevan. Upload laporan keuangan dulu.",
        )

    # 2) susun konteks
    context = "\n\n".join(
        f"[{c['filename']} bagian {c['chunk_index'] + 1}]\n{c['text']}" for c in chunks
    )
    prompt = (
        "Jawab pertanyaan berikut BERDASARKAN DOKUMEN yang diberikan (laporan keuangan). "
        "Gunakan angka & fakta dari dokumen. Bila jawaban tidak ada di dokumen, katakan demikian. "
        "Jawab dalam bahasa Indonesia, ringkas (maks 250 kata).\n\n"
        f"=== DOKUMEN ===\n{context}\n\n=== PERTANYAAN ===\n{req.question}"
    )

    try:
        result = await get_gateway().generate(
            prompt,
            system="Kamu adalah analis keuangan yang teliti, menjawab hanya berdasarkan dokumen yang diberikan.",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "success": True,
        "data": {
            "answer": result["content"],
            "provider": result["provider"],
            "model_alias": result["model_alias"],
            "sources": chunks,
            "rag_stats": rag_store.stats(),
        },
    }


@router.delete("/rag/documents/{doc_id}")
async def delete_document(doc_id: str) -> dict:
    ok = rag_store.delete_document(doc_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")
    return {"success": True, "data": {"deleted": True}}
