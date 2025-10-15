import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { handleExpulsionLogic } from '@/lib/services/expulsionService';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { studentId, reason, assigner } = await request.json();

    if (!studentId || !reason || !assigner) {
      return NextResponse.json({ error: 'studentId, reason, assigner는 필수 항목입니다.' }, { status: 400 });
    }

    // 1. 경고 생성
    const newWarning = await prisma.warning.create({
      data: {
        studentId,
        reason,
      },
    });

    // 2. 이번 달 누적 경고 횟수 확인
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const warningsInMonth = await prisma.warning.findMany({
      where: {
        studentId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // 3. 누적 경고가 2회 이상이면 벌점 5점 부여
    if (warningsInMonth.length >= 2) {
      // 5점 벌점 생성
      await prisma.demerit.create({
        data: {
          studentId,
          points: 5,
          reason: '경고 2회 누적',
          assigner,
        },
      });

      // 사용된 경고 삭제
      await prisma.warning.deleteMany({
        where: {
          id: {
            in: warningsInMonth.map(w => w.id),
          },
        },
      });

      // 벌점 부여에 따른 퇴출 로직 실행
      await handleExpulsionLogic(studentId);
    }

    return NextResponse.json(newWarning, { status: 201 });
  } catch (error) {
    console.error('Error creating warning:', error);
    return NextResponse.json({ error: '경고를 부여하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
