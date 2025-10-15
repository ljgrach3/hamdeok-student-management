import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { handleExpulsionLogic } from '@/lib/services/expulsionService';

const prisma = new PrismaClient();

// 새 벌점 기록 추가 (POST)
export async function POST(request: Request) {
  try {
    const { studentId, points, reason, assigner } = await request.json();

    if (!studentId || !points || !reason || !assigner) {
      return NextResponse.json({ error: 'studentId, points, reason, assigner는 필수 항목입니다.' }, { status: 400 });
    }

    const newDemerit = await prisma.demerit.create({
      data: {
        studentId,
        points: Number(points),
        reason,
        assigner,
      },
    });

    // 벌점 부여 후 분리된 퇴출 로직 실행
    await handleExpulsionLogic(studentId);

    return NextResponse.json(newDemerit, { status: 201 });
  } catch (error) {
    console.error('Error creating demerit:', error);
    return NextResponse.json({ error: '벌점을 부여하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
