import bcrypt from 'bcrypt';
import { prisma } from '../src/config/prisma.js';

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const coreModule = await prisma.module.upsert({
    where: { name: 'MODULE_1' },
    update: {},
    create: { name: 'MODULE_1' }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: userPassword,
      role: 'USER',
      isActive: true
    }
  });

  await prisma.userModule.upsert({
    where: { userId_moduleId: { userId: admin.id, moduleId: coreModule.id } },
    update: {},
    create: { userId: admin.id, moduleId: coreModule.id }
  });

  await prisma.userModule.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId: coreModule.id } },
    update: {},
    create: { userId: user.id, moduleId: coreModule.id }
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
