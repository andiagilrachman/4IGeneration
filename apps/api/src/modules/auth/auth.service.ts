import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  /** Placeholder — dikembalikan sampai implementasi Week 2 selesai. */
  stubNotImplemented(feature: string) {
    return {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: `Auth feature '${feature}' belum diimplementasikan (TODO Week 2 roadmap).`,
      },
    };
  }
}
