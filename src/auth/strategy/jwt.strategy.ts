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
          console.log('🍪 Cookies recibidas:', request?.cookies);
          console.log('🔑 Token extraído:', request?.cookies?.access_token);
          return request?.cookies?.access_token;
        },
      ]),
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });

    console.log('✅ JwtStrategy inicializada con secret:', config.get('JWT_SECRET') ? 'PRESENTE' : 'AUSENTE');
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    console.log('🔍 Validando payload JWT:', payload);

    const user = await this.prisma.user.findUnique({
      where: { user_id: payload.sub },
    });

    console.log('👤 Usuario encontrado:', user ? `ID ${user.user_id}` : 'NO ENCONTRADO');

    if (!user) {
      console.log('❌ Usuario no encontrado en BD');
      return null;
    }

    const { password_hash, ...result } = user;
    console.log('✅ Usuario validado correctamente:', result.email);
    return result;
  }
}