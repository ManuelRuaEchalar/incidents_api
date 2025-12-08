import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';

@Injectable()
export class IncidentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateIncidentDto) {
    return this.prisma.incident.create({
      data: {
        ...dto,
        user_id: userId,
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
        category: true,
        status: true,
        city: true,
      },
    });
  }

  async findAll(userId?: number, role?: string) {
    // Admin puede ver todos, ciudadanos solo los suyos
    const where = role === 'ADMIN' ? {} : { user_id: userId };

    return this.prisma.incident.findMany({
      where,
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
        category: true,
        status: true,
        city: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number, userId?: number, role?: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { incident_id: id },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
        category: true,
        status: true,
        city: true,
      },
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    // Verificar permisos: solo el dueño o admin pueden ver
    if (role !== 'ADMIN' && incident.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return incident;
  }

  async update(id: number, userId: number, role: string, dto: UpdateIncidentDto) {
    const incident = await this.findOne(id, userId, role);

    // Solo el dueño puede actualizar (o admin)
    if (role !== 'ADMIN' && incident.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.incident.update({
      where: { incident_id: id },
      data: dto,
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
        category: true,
        status: true,
        city: true,
      },
    });
  }

  async remove(id: number, userId: number, role: string) {
    const incident = await this.findOne(id, userId, role);

    // Solo el dueño puede eliminar (o admin)
    if (role !== 'ADMIN' && incident.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.incident.delete({
      where: { incident_id: id },
    });
  }

  // Solo admin puede actualizar el estado
  async updateStatus(id: number, status_id: number) {
    await this.prisma.incident.findUniqueOrThrow({
      where: { incident_id: id },
    });

    return this.prisma.incident.update({
      where: { incident_id: id },
      data: { status_id },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
        category: true,
        status: true,
        city: true,
      },
    });
  }
}