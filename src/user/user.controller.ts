import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { type User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { EditUserDto } from './dto/edit-user.dto'; // Importa tu DTO

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get('me')
    getMe(@GetUser() user: User) {
        return user;
    }

    @Get('my-stats')
    async getMyStats(@GetUser() user: User) {
        return this.userService.getUserStats(user.user_id);
    }

    // src/user/user.controller.ts
    @Patch()
    editUser(
        @GetUser() user: User,        // ← Recibe todo el usuario (con user_id incluido)
        @Body() dto: EditUserDto,
    ) {
        return this.userService.editUser(user.user_id, dto);
    }
}