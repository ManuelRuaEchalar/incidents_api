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
import { StatusService } from './status.service';
import { CreateStatusDto, UpdateStatusDto } from './dto/status.dto';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';


@Controller('statuses')
export class StatusController {
  constructor(private readonly statusService: StatusService) { }

  @Post()
  @UseGuards(JwtGuard)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateStatusDto) {
    return this.statusService.create(dto);
  }

  @Get()
  findAll() {
    return this.statusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statusService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.statusService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statusService.remove(id);
  }
}