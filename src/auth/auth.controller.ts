import { Body, Controller, Post, Res, Headers } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  async signup(
    @Body() dto: SignUpDto,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(dto);

    // Detectar si es cliente móvil o web
    const isMobile = this.isMobileClient(userAgent);

    if (isMobile) {
      // Para móvil: devolver token en JSON
      return result;
    } else {
      // Para web: establecer cookie HttpOnly
      this.setAuthCookie(res, result.access_token);
      return { message: 'Registro exitoso' };
    }
  }

  @Post('signin')
  async signin(
    @Body() dto: SignInDto,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signin(dto);

    const isMobile = this.isMobileClient(userAgent);

    if (isMobile) {
      return result;
    } else {
      this.setAuthCookie(res, result.access_token);
      return { message: 'Inicio de sesión exitoso' };
    }
  }

  private isMobileClient(userAgent: string): boolean {
    // Detectar si es la app Flutter
    return userAgent?.toLowerCase().includes('dart') ||
      userAgent?.toLowerCase().includes('flutter');
  }

  private setAuthCookie(res: Response, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // CAMBIO CRÍTICO AQUÍ:
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
    });
  }
}