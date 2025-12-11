import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto, UpdateCityDto } from './dto/city.dto';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateCityDto) {
    return this.prisma.city.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.city.findMany({
      include: {
        _count: {
          select: { incidents: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const city = await this.prisma.city.findUnique({
      where: { city_id: id },
      include: {
        _count: {
          select: { incidents: true },
        },
      },
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async update(id: number, dto: UpdateCityDto) {
    await this.findOne(id); // Verifica que existe

    return this.prisma.city.update({
      where: { city_id: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verifica que existe

    return this.prisma.city.delete({
      where: { city_id: id },
    });
  }
}