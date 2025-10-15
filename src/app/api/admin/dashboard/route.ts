import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // 1. 이번 달 벌점 현황 데이터
    const demeritsThisMonth = await prisma.demerit.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        student: true,
      },
    });

    // 학생별로 벌점을 합산
    const demeritSummary = demeritsThisMonth.reduce((acc, demerit) => {
      if (!acc[demerit.studentId]) {
        acc[demerit.studentId] = {
          student: demerit.student,
          totalPoints: 0,
        };
      }
      acc[demerit.studentId].totalPoints += demerit.points;
      return acc;
    }, {} as Record<string, { student: any; totalPoints: number }>);

    const monthlyDemerits = Object.values(demeritSummary).sort((a, b) => b.totalPoints - a.totalPoints);

    // 2. 퇴출 및 퇴출 예정 학생 데이터
    const expulsions = await prisma.expulsion.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACTIVE'],
        },
      },
      include: {
        student: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json({ monthlyDemerits, expulsions });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
