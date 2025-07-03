import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAgentDto } from './dtos/create-agent.dto';
import * as bcrypt from 'bcrypt';
import { SystemStats } from './interfaces/system-stats.interface';
import { $Enums } from '../../generated/prisma';
import UserRole = $Enums.UserRole;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<SystemStats> {
    const [
      totalUsers,
      totalAgents,
      totalCustomers,
      totalVehicles,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenueResult,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.AGENT } }),
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      this.prisma.vehicle.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['CONFIRMED'] },
        },
      }),
    ]);

    return {
      totalUsers,
      totalAgents,
      totalCustomers,
      totalVehicles,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue: totalRevenueResult._sum.totalAmount?.toNumber() || 0,
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
        role: UserRole.AGENT,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN)
      throw new ForbiddenException('Cannot delete admin');
    return this.prisma.user.delete({ where: { id } });
  }
}
