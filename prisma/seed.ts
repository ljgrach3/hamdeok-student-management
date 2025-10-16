import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('your_admin_password', 10); // 'your_admin_password'를 원하는 관리자 비밀번호로 변경하세요.

  // 기존에 admin_username을 가진 사용자가 있는지 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin_username' }, // 'admin_username'을 원하는 관리자 사용자 이름으로 변경하세요.
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin_username',
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      } as any, // TypeScript 타입 검사를 일시적으로 우회
    });
    console.log(`Created admin user with ID: ${adminUser.id}`);
  } else {
    console.log(`Admin user with username admin_username already exists. Skipping creation.`);
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
