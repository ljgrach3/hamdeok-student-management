import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // PrismaClientKnownRequestError import

const prisma = new PrismaClient();

// 모든 학생 목록 조회 (GET)
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: [
        { grade: 'asc' },
        { classNum: 'asc' },
        { name: 'asc' },
      ],
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: '학생 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 새 학생 추가 (POST)
export async function POST(request: Request) {
  try {
    const { grade, classNum, name } = await request.json();

    if (!grade || !classNum || !name) {
      return NextResponse.json({ error: '학년, 반, 이름은 필수 항목입니다.' }, { status: 400 });
    }

    const newStudent = await prisma.student.create({
      data: {
        grade: Number(grade),
        classNum: Number(classNum),
        name,
      },
    });
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    // Prisma unique constraint violation
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') { // any 대신 PrismaClientKnownRequestError 사용
        return NextResponse.json({ error: '이미 등록된 학생입니다.' }, { status: 409 });
    }
    return NextResponse.json({ error: '학생을 추가하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
