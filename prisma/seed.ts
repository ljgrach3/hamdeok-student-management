import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('hamdeokadmin', 10); // 'your_admin_password'를 원하는 관리자 비밀번호로 변경하세요.

  // 기존에 admin_username을 가진 사용자가 있는지 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' }, // 'admin_username'을 원하는 관리자 사용자 이름으로 변경하세요.
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin', // 'admin_username'을 원하는 관리자 사용자 이름으로 변경하세요.
        name: 'admin', // 표시 이름
        email: 'ljgrach3@gmail.com', // 관리자 이메일 (로그인에 사용되지 않더라도 필요할 수 있음)
        password: hashedPassword,
        role: 'ADMIN',
      },
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