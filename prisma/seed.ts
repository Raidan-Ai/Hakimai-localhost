import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Default Admin
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@hakim.raidan.pro';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Super Admin',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Create Default System Config
  const config = await prisma.systemConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      baseUrl: 'https://hakim.raidan.pro',
      aiMode: 'HYBRID',
      activeCloud: 'GEMINI',
      ollamaUrl: 'http://127.0.0.1:11434',
      publicTrialEnabled: false,
    },
  });

  console.log('✅ Default system configuration initialized.');

  console.log('🏁 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
