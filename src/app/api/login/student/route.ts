import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { grade, classNum, name } = await request.json();

    if (!grade || !classNum || !name) {
      return NextResponse.json({ error: '학년, 반, 이름은 필수 항목입니다.' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: {
        unique_student: { // schema.prisma에서 정의한 @@unique 필드 이름
          grade: Number(grade),
          classNum: Number(classNum),
          name,
        },
      },
    });

    if (student) {
      // 실제 애플리케이션에서는 세션이나 JWT를 생성하여 반환합니다.
      // 지금은 로그인 성공을 알리고 학생 정보를 반환합니다.
      return NextResponse.json(student);
    } else {
      return NextResponse.json({ error: '일치하는 학생 정보가 없습니다.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json({ error: '로그인 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
