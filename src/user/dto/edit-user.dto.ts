import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    profile_pic_url?: string;

    // ¡Importante! El nombre debe coincidir exactamente con el campo en Prisma
    @IsString()
    @IsOptional()
    password?: string; // ← El usuario envía "password" (texto plano), NO "password_hash"
}