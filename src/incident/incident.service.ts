import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';

// Nombre del bucket en Supabase (créalo como 'Public' en el dashboard de Supabase)
const BUCKET_NAME = 'incidents';

@Injectable()
export class IncidentService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  // --- CREAR INCIDENTE ---
  async create(
    userId: number,
    dto: CreateIncidentDto,
    photo?: Express.Multer.File,
  ) {
    let photoUrl: string | null = null;

    // Si recibimos un archivo, lo subimos a Supabase
    if (photo) {
      photoUrl = await this.supabase.uploadFile(photo, BUCKET_NAME);
    }

    return this.prisma.incident.create({
      data: {
        ...dto,
        user_id: userId,
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
        category: true, // Traemos el objeto completo de categoria
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
            username: true, // Solo mostramos el nombre del usuario
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
    // 1. Buscamos el incidente actual
    const incident = await this.findOne(id);

    // 2. Verificamos permisos (Solo dueño o Admin)
    if (role !== 'ADMIN' && incident.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    let photoUrl = incident.photo_url;

    // 3. Gestión de la foto
    if (photo) {
      // A. Si ya tenía foto, borrar la vieja de Supabase
      if (incident.photo_url) {
        await this.supabase.deleteFile(incident.photo_url, BUCKET_NAME);
      }

      // B. Subir la nueva foto
      photoUrl = await this.supabase.uploadFile(photo, BUCKET_NAME);
    }

    // 4. Actualizar en DB
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

    // 1. Verificamos permisos
    if (role !== 'ADMIN' && incident.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // 2. Si tiene foto, borrarla de Supabase Storage
    if (incident.photo_url) {
      await this.supabase.deleteFile(incident.photo_url, BUCKET_NAME);
    }

    // 3. Eliminar registro de la DB
    return this.prisma.incident.delete({
      where: { incident_id: id },
    });
  }

  // --- CAMBIAR ESTADO (SOLO ADMIN) ---
  async updateStatus(id: number, status_id: number) {
    // Verificar que existe antes de actualizar
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