import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Extraer JWT de múltiples fuentes
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Desde Header Authorization (móvil)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // 2. Desde Cookie (web)
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: payload.sub },
    });

    if (!user) return null;

    const { password_hash, ...result } = user;
    return result; // ← Ahora user.user_id existe y está disponible
  }
}