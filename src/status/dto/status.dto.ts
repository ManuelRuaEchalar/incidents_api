import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  description: string;
}

export class UpdateStatusDto {
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsString()
  @MaxLength(150)
  description?: string;
}