import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateIncidentDto {
  @IsInt()
  @IsNotEmpty()
  category_id: number;

  @IsInt()
  @IsOptional()
  city_id?: number;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  photo_url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address_ref?: string;
}

export class UpdateIncidentDto {
  @IsInt()
  @IsOptional()
  category_id?: number;

  @IsInt()
  @IsOptional()
  status_id?: number;

  @IsInt()
  @IsOptional()
  city_id?: number;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  photo_url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address_ref?: string;
}