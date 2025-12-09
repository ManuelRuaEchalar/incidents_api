import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global() // Hace que esté disponible en toda la app
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}