import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RagService } from "./rag.service";

/**
 * RAG Q&A endpoints (W21-24) — 🔒 login:
 * POST   /rag/upload            → upload PDF laporan keuangan (multipart)
 * GET    /rag/documents         → daftar dokumen
 * POST   /rag/ask               → tanya jawab berdasarkan dokumen
 * DELETE /rag/documents/:id     → hapus dokumen
 */
@Controller("rag")
@UseGuards(JwtAuthGuard)
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser("id") _userId: string,
  ) {
    if (!file) {
      throw new Error("File wajib diunggah");
    }
    return this.ragService.uploadPdf(file);
  }

  @Get("documents")
  documents() {
    return this.ragService.listDocuments();
  }

  @Post("ask")
  ask(@Body() body: { question: string; doc_id?: string }) {
    return this.ragService.ask(body.question, body.doc_id);
  }

  @Delete("documents/:id")
  remove(@Param("id") id: string) {
    return this.ragService.deleteDocument(id);
  }
}
