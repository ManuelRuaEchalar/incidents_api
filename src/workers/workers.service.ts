import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';

/**
 * WorkersService - Servicio para hashear y verificar contraseñas
 * 
 * NOTA: Versión simplificada sin Worker Threads para compatibilidad con Vercel.
 * Worker Threads no funcionan en entornos serverless.
 */
@Injectable()
export class WorkersService {
    /**
     * Hashea una contraseña usando argon2
     */
    async hashPassword(password: string): Promise<string> {
        return argon.hash(password);
    }

    /**
     * Verifica una contraseña contra su hash
     */
    async verifyPassword(hash: string, password: string): Promise<boolean> {
        return argon.verify(hash, password);
    }
}
