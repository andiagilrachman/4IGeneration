import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { StocksModule } from "./modules/stocks/stocks.module";
import { AnalysisModule } from "./modules/analysis/analysis.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // TODO (fase berikutnya): SubscriptionModule, PlansModule, PaymentsModule,
    // CreditsModule, ApiKeysModule, ProvidersModule, StocksModule, AnalysisModule,
    // UsageModule, SettingsModule, PromptsModule, AuditModule, NotificationsModule, ...
    AuthModule,
    UsersModule,
    StocksModule,
    AnalysisModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
