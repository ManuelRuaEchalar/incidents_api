import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto, SignInDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}
   
    async signup(dto: SignUpDto) {
    const hash = await argon.hash(dto.password);
    try {
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                password_hash: hash,
                role: dto.role || 'CITIZEN',  // ← Agrega esta línea
            },
            select: {
                user_id: true,
                username: true,
                email: true,
                role: true,
                created_at: true,
            }
        });
        return this.signToken(user.user_id, user.email, user.role);
    } catch (error) {
        if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials taken');
        }
        throw error;      
    }
}

    async signin(dto: SignInDto) {
        // find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new ForbiddenException('Credentials incorrect');
        }

        // compare password
        const pwMatches = await argon.verify(user.password_hash, dto.password);
        if (!pwMatches) {
            throw new ForbiddenException('Credentials incorrect');
        }

        return this.signToken(user.user_id, user.email, user.role);
    }

    async signToken(userId: number, email: string, role: string): Promise<{ access_token: string }> {
  const payload = {
    sub: userId,
    email,
    role,  // ← Asegúrate de incluir el role aquí
  };
  const secret = this.config.get('JWT_SECRET');

  const token = await this.jwt.signAsync(payload, {
    expiresIn: '15m',
    secret: secret,
  });

  return {
    access_token: token,
  };
}
}