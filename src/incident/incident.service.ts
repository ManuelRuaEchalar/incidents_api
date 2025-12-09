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

  // Obtener TODOS los incidentes (para el mapa público)
  // Obtener TODOS los incidentes (para el mapa público)
async findAll() {
  return this.prisma.incident.findMany({
    select: {
      incident_id: true,
      category_id: true,
      city_id: true,
      latitude: true,
      longitude: true,
      description: true,
      photo_url: true,
      address_ref: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

  // Obtener solo los incidentes del usuario autenticado (para "Mis Reportes")
  async findMyIncidents(userId: number) {
    return this.prisma.incident.findMany({
      where: { user_id: userId },
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

  async findOne(id: number) {
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

    return incident;
  }

  async update(id: number, userId: number, role: string, dto: UpdateIncidentDto) {
    const incident = await this.findOne(id);

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
    const incident = await this.findOne(id);

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