import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow('SUPABASE_URL'),
      this.configService.getOrThrow('SUPABASE_KEY'),
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async uploadFile(file: Express.Multer.File, bucket: string): Promise<string> {
    const fileName = `${Date.now()}_${file.originalname.replace(/\s/g, '')}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Error subiendo a Supabase:', error);
      throw new InternalServerErrorException('No se pudo subir la imagen');
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  // --- NUEVO MÉTODO AGREGADO ---
  async deleteFile(publicUrl: string, bucket: string): Promise<void> {
    try {
      // La URL pública suele ser: .../storage/v1/object/public/incidents/nombre_archivo.jpg
      // Necesitamos extraer solo "nombre_archivo.jpg" (o la ruta relativa dentro del bucket)
      
      const urlParts = publicUrl.split(`/${bucket}/`);
      if (urlParts.length < 2) {
        console.warn('URL de imagen no coincide con el formato esperado para eliminar');
        return;
      }
      
      const filePath = urlParts[1]; // Esto nos da lo que está después del nombre del bucket

      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Error eliminando archivo de Supabase:', error);
        // No lanzamos error fatal aquí para no romper la transacción de base de datos si la imagen ya no existe
      }
    } catch (e) {
      console.error('Error procesando eliminación de archivo:', e);
    }
  }
}