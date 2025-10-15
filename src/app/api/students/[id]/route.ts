import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // PrismaClientKnownRequestError import

const prisma = new PrismaClient();

// 학생 상세 정보 조회 (GET)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: '학생 ID가 필요합니다.' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        demerits: { orderBy: { date: 'desc' } },
        warnings: { orderBy: { date: 'desc' } },
        expulsions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: '해당 학생을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json({ error: '학생 상세 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 학생 삭제 (DELETE)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: '학생 ID가 필요합니다.' }, { status: 400 });
    }

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: '학생이 성공적으로 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting student:', error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') { // any 대신 PrismaClientKnownRequestError 사용
        return NextResponse.json({ error: '해당 학생을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ error: '학생 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
