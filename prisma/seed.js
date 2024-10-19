// prisma/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hardcoded admin details
  const adminEmail = 'admin@example';         // Replace with desired admin email
  const adminPassword = 'your_password#';  // Replace with desired admin password
  const adminName = 'Admin User'; 

  // Check if the admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  // Hash the admin password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create the admin user
  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log('Admin user created:', {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    isAdmin: admin.isAdmin,
  });
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
