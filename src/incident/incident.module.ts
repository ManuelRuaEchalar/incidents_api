import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IncidentService } from './incident.service';
import { IncidentController } from './incident.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [IncidentController],
  providers: [IncidentService],
})
export class IncidentModule { }