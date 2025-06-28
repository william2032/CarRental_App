import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LocationsModule } from './locations/locations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import {AppMailerModule} from "./mailer/mailer.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    VehiclesModule,
    PrismaModule,
    LocationsModule,
    UsersModule,
    AuthModule,
    BookingsModule,
    AppMailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
