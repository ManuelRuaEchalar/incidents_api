import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors, // <--- Importar
  UploadedFile,    // <--- Importar
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // <--- Importar
import { IncidentService } from './incident.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { type User } from '@prisma/client';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';


@Controller('incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) { }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('photo')) // <--- ESTO ES CRUCIAL. Permite leer el Body y el Archivo.
  create(
    @GetUser() user: User,
    @Body() dto: CreateIncidentDto,
    @UploadedFile() photo?: Express.Multer.File, // <--- Capturamos la foto aquí
  ) {
    // NestJS ya habrá convertido los strings de lat/lon a números gracias al main.ts
    return this.incidentService.create(user.user_id, dto, photo);
  }

  // Obtener TODOS los incidentes (mapa público)
  @Get()
  findAll() {
    return this.incidentService.findAll();
  }

  // Obtener solo MIS incidentes
  @Get('my-incidents')
  @UseGuards(JwtGuard)
  findMyIncidents(@GetUser() user: User) {
    return this.incidentService.findMyIncidents(user.user_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('photo')) // También necesario si actualizas foto
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() dto: UpdateIncidentDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.incidentService.update(id, user.user_id, user.role, dto, photo);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.incidentService.remove(id, user.user_id, user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status_id', ParseIntPipe) status_id: number,
  ) {
    return this.incidentService.updateStatus(id, status_id);
  }

  // Estadísticas por Ciudad
  @Get('city-stats/:cityId')
  getCityStats(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.incidentService.getCityStats(cityId);
  }
}