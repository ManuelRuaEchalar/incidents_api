import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;
}

export class UpdateCityDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;
}