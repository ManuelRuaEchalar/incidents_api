import { IsNotEmpty, IsNumber, IsOptional, IsString, IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';
// Elimina la importación de @prisma/client... no la necesitas aquí.

export class CreateIncidentDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  category_id: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  city_id?: number;

  @IsNotEmpty()
  @IsLatitude() // Valida que sea una latitud real (-90 a 90)
  @Type(() => Number) // Convierte string a number si es necesario
  latitude: number;   // <--- Cambiado a number

  @IsNotEmpty()
  @IsLongitude() // Valida que sea una longitud real (-180 a 180)
  @Type(() => Number)
  longitude: number;  // <--- Cambiado a number

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address_ref?: string;

  // La foto se manejará por separado en el controller
}

export class UpdateIncidentDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  category_id?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  status_id?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  city_id?: number;

  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latitude?: number;  // <--- Cambiado a number

  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  longitude?: number; // <--- Cambiado a number

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address_ref?: string;
}