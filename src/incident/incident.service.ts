import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';

const BUCKET_NAME = 'incident-photos';

@Injectable()
export class IncidentService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) { }

  // --- CREAR INCIDENTE ---
  async create(
    userId: number,
    dto: CreateIncidentDto,
    photo?: Express.Multer.File,
  ) {
    let photoUrl: string | null = null;

    if (photo) {
      photoUrl = await this.supabase.uploadFile(photo, BUCKET_NAME);
    }

    return this.prisma.incident.create({
      data: {
        user_id: userId,
        category_id: dto.category_id, // Asegúrate de asignar esto explícitamente si no usas spread completo
        city_id: dto.city_id,
        latitude: dto.latitude,   // Aquí llegará un number
        longitude: dto.longitude, // Aquí llegará un number
        description: dto.description,
        address_ref: dto.address_ref,
        photo_url: photoUrl,
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

  // --- OBTENER TODOS (FEED PÚBLICO) ---
  async findAll() {
    return this.prisma.incident.findMany({
      select: {
        incident_id: true,
        category: true,
        status: true,
        city: true,
        latitude: true,
        longitude: true,
        description: true,
        photo_url: true,
        address_ref: true,
        created_at: true,
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // --- OBTENER MIS INCIDENTES ---
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

  // --- OBTENER UN INCIDENTE POR ID ---
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

  // --- ACTUALIZAR INCIDENTE ---
  async update(
    id: number,
    userId: number,
    role: string,
    dto: UpdateIncidentDto,
    photo?: Express.Multer.File,
  ) {
    const incident = await this.findOne(id);

    if (role !== 'ADMIN' && incident.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    let photoUrl = incident.photo_url;

    if (photo) {
      if (incident.photo_url) {
        await this.supabase.deleteFile(incident.photo_url, BUCKET_NAME);
      }
      photoUrl = await this.supabase.uploadFile(photo, BUCKET_NAME);
    }

    return this.prisma.incident.update({
      where: { incident_id: id },
      data: {
        ...dto,
        photo_url: photoUrl,
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

  // --- ELIMINAR INCIDENTE ---
  async remove(id: number, userId: number, role: string) {
    const incident = await this.findOne(id);

    if (role !== 'ADMIN' && incident.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (incident.photo_url) {
      await this.supabase.deleteFile(incident.photo_url, BUCKET_NAME);
    }

    return this.prisma.incident.delete({
      where: { incident_id: id },
    });
  }

  // --- CAMBIAR ESTADO ---
  async updateStatus(id: number, status_id: number) {
    await this.findOne(id);
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