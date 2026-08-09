import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return {
      success: true,
      data: {
        service: "4ig-api",
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    };
  }
}
