import * as bcrypt from 'bcrypt';
import { $Enums, PrismaClient } from '../generated/prisma';
import UserRole = $Enums.UserRole;

const prisma = new PrismaClient();
const adminEmail = 'kivindukilonzo@gmail.com';
const adminPassword = 'admin123';

async function main() {
  await prisma.user.deleteMany({ where: { email: adminEmail } });

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
