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
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB para fotos
        fieldSize: 50 * 1024,       // 50KB para campos de texto (descripciones largas)
        fields: 10,                  // Máximo 10 campos
      },
    }),
  ],
  controllers: [IncidentController],
  providers: [IncidentService],
})
export class IncidentModule { }