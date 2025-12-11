import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { CityModule } from './city/city.module';
import { StatusModule } from './status/status.module';
import { IncidentModule } from './incident/incident.module';
import { CategoryModule } from './category/category.module';
import { WorkersModule } from './workers/workers.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WorkersModule,
    AuthModule,
    UserModule,
    PrismaModule,
    CityModule,
    StatusModule,
    IncidentModule,
    CategoryModule,
    SupabaseModule,
  ],
})
export class AppModule { }