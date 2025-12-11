import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatusDto, UpdateStatusDto } from './dto/status.dto';

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateStatusDto) {
    return this.prisma.status.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.status.findMany({
      include: {
        _count: {
          select: { incidents: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const status = await this.prisma.status.findUnique({
      where: { status_id: id },
      include: {
        _count: {
          select: { incidents: true },
        },
      },
    });

    if (!status) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }

    return status;
  }

  async update(id: number, dto: UpdateStatusDto) {
    await this.findOne(id);

    return this.prisma.status.update({
      where: { status_id: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.status.delete({
      where: { status_id: id },
    });
  }
}