import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

// DTO para registro de usuario
export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  profile_pic_url?: string;

  @IsEnum(['CITIZEN', 'ADMIN'])
  @IsOptional()
  role?: string;
}