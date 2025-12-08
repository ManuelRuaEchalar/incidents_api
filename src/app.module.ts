import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';


import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { CityModule } from './city/city.module';
import { StatusModule } from './status/status.module';
import { IncidentModule } from './incident/incident.module';
import { CategoryModule } from './category/category.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
     UserModule,
       PrismaModule,
       CityModule,
       StatusModule,
       IncidentModule,
       CategoryModule],
})
export class AppModule {}
