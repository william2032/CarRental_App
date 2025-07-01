import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAgentDto } from './dtos/create-agent.dto';
import * as bcrypt from 'bcrypt';
import { SystemStats } from './interfaces/system-stats.interface';
import { Role } from '../common/enums/roles.enum';
import { $Enums } from '../../generated/prisma';
import BookingStatus = $Enums.BookingStatus;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<SystemStats> {
    const [
      totalUsers,
      totalAgents,
      totalCustomers,
      totalVehicles,
      activeBookings,
      completedBookings,
      totalRevenueResult,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.AGENT } }),
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.vehicle.count(),
      this.prisma.booking.count({ where: { status: 'ACTIVE' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: BookingStatus.CONFIRMED },
      }),
    ]);

    return {
      totalUsers,
      totalAgents,
      totalCustomers,
      totalVehicles,
      activeBookings,
      completedBookings,
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
    };
  }

  async listUsers() {
    return this.prisma.user.findMany();
  }

  async createAgent(dto: CreateAgentDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: Role.AGENT,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === Role.ADMIN)
      throw new ForbiddenException('Cannot delete admin');
    return this.prisma.user.delete({ where: { id } });
  }
}
