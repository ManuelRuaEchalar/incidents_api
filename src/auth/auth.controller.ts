import { Body, Controller, Post, Res, Headers, HttpCode } from '@nestjs/common';
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

  @Post('logout')
  @HttpCode(200) // Importante: logout debe devolver 200, no 204 si envías JSON
  async logout(
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isMobile = this.isMobileClient(userAgent);

    if (isMobile) {
      // Cliente móvil (Flutter, etc.) → solo responde éxito
      return { message: 'Sesión cerrada correctamente' };
    } else {
      // Cliente web → borramos la cookie HttpOnly
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/', // Importante: mismo path que al crear la cookie
      });

      return { message: 'Sesión cerrada correctamente' };
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
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/', // ← Asegúrate de usar el mismo path al borrar
    });
  }
}