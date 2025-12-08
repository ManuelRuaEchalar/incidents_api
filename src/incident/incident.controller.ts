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
} from '@nestjs/common';
import { IncidentService } from './incident.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incident.dto';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { type User } from '@prisma/client';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@UseGuards(JwtGuard)
@Controller('incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateIncidentDto) {
    return this.incidentService.create(user.user_id, dto);
  }

  // Obtener TODOS los incidentes (mapa público)
  @Get()
  findAll() {
    return this.incidentService.findAll();
  }

  // Obtener solo MIS incidentes (sección "Mis Reportes")
  @Get('my-incidents')
  findMyIncidents(@GetUser() user: User) {
    return this.incidentService.findMyIncidents(user.user_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentService.update(id, user.user_id, user.role, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.incidentService.remove(id, user.user_id, user.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status_id', ParseIntPipe) status_id: number,
  ) {
    return this.incidentService.updateStatus(id, status_id);
  }
}