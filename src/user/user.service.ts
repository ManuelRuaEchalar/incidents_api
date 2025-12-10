import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async editUser(userId: number, dto: EditUserDto) {
        const updateData: any = { ...dto };

        // Si el usuario quiere cambiar la contraseña
        if (dto.password) {
            updateData.password_hash = await argon2.hash(dto.password);
            // No enviamos el password en plano a Prisma
            delete updateData.password;
        }

        // Actualizamos el usuario
        const user = await this.prisma.user.update({
            where: { user_id: userId },
            data: updateData,
        });

        // ¡Importante! Eliminar el hash antes de devolver
        // El tipo de 'user' incluye password_hash, así que lo quitamos manualmente
        const { password_hash, ...safeUser } = user;

        return safeUser;
    }

    async getUserStats(userId: number) {
        const [totalReports, resolvedReports, followingReports] = await Promise.all([
            this.prisma.incident.count({
                where: { user_id: userId },
            }),
            this.prisma.incident.count({
                where: { user_id: userId, status_id: 3 },
            }),
            this.prisma.incident.count({
                where: { user_id: userId, status_id: 2 },
            }),
        ]);

        return {
            total_reports: totalReports,
            resolved_reports: resolvedReports,
            following_reports: followingReports,
        };
    }
}