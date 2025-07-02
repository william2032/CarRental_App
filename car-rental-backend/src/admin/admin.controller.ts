import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { SystemStats } from './interfaces/system-stats.interface';
import { RolesGuard } from '../auth/guards/roles.guard';
import { $Enums } from '../../generated/prisma';
import UserRole = $Enums.UserRole;
import { Roles } from '../auth/decorators/role-decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats(): Promise<SystemStats> {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers() {
    return this.adminService.listUsers();
  }

  @Post('agents')
  createAgent(@Body() dto: CreateAgentDto) {
    return this.adminService.createAgent(dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
