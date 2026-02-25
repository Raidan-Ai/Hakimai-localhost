import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting the seeding process...');

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set in your .env file');
  }

  // Check if the admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Super Admin user already exists. Skipping creation.');
  } else {
    console.log('Creating Super Admin user...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });
    console.log('Super Admin user created successfully.');
  }

  // You can add other seed data here, e.g., initial SystemConfig
  const existingConfig = await prisma.systemConfig.findFirst();
  if (!existingConfig) {
    console.log('Creating initial system configuration...');
    await prisma.systemConfig.create({
      data: {
        // Initial default settings can be placed here
        publicTrialEnabled: false,
        trialMessageLimit: 10,
      }
    });
    console.log('Initial system configuration created.');
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
