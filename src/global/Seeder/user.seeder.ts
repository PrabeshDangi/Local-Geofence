import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function script() {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hasedPassword = await bcrypt.hash('Admin123', salt);

    const users = await prisma.user.findMany({});

    if (users.length > 0) {
      await prisma.user.deleteMany({
        where: {
          role: 'admin',
        },
      });
    }

    await prisma.user.create({
      data: {
        name: 'admin',
        password: hasedPassword,
        email: 'admin@gmail.com',
        role: 'admin',
        isEmailVerified: true,
      },
    });
    console.log('Admin data seeded successfully!!');
  } catch (error) {
    console.log('Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

script()
  .then(() => {
    console.log('Seeding complete!!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding!!');
    process.exit(1);
  });
