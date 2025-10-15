import { PrismaClient, Demerit } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 학생의 누적 벌점에 따라 퇴출을 생성하거나 업데이트하는 함수
 * @param studentId 학생 ID
 */
export async function handleExpulsionLogic(studentId: string) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // 1. 이번 달 누적 벌점 계산
  const studentWithDemerits = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      demerits: {
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      },
      expulsions: {
        where: {
          status: { in: ['PENDING', 'ACTIVE'] }
        }
      }
    },
  });

  if (!studentWithDemerits) return;

  const totalPoints = studentWithDemerits.demerits.reduce((sum: number, d: Demerit) => sum + d.points, 0);

  // 2. 벌점이 5점 미만이면 퇴출 로직을 실행하지 않음
  if (totalPoints < 5) {
    return;
  }

  // 3. 퇴출 기간 계산
  const expulsionDays = totalPoints - 4;

  // 4. 퇴출 시작일 계산 (다음 주 월요일)
  const demeritDate = new Date();
  const dayOfWeek = demeritDate.getDay(); // 0=일, 1=월, ..., 6=토
  const daysUntilNextMonday = (7 - dayOfWeek + 1) % 7 || 7;
  const startDate = new Date(demeritDate);
  startDate.setDate(demeritDate.getDate() + daysUntilNextMonday);
  startDate.setHours(0, 0, 0, 0);

  // 5. 퇴출 종료일 계산 (월,화,수,목만 카운트)
  let remainingDays = expulsionDays;
  const endDate = new Date(startDate);
  while (remainingDays > 0) {
    const currentDay = endDate.getDay();
    if (currentDay >= 1 && currentDay <= 4) {
      remainingDays--;
    }
    if (remainingDays > 0) {
      endDate.setDate(endDate.getDate() + 1);
    }
  }

  // 6. 데이터베이스에 퇴출 정보 생성 또는 업데이트
  const existingExpulsion = studentWithDemerits.expulsions[0];

  if (existingExpulsion) {
    await prisma.expulsion.update({
      where: { id: existingExpulsion.id },
      data: {
        startDate,
        endDate,
        totalDays: expulsionDays,
        status: 'PENDING',
      },
    });
  } else {
    await prisma.expulsion.create({
      data: {
        studentId,
        startDate,
        endDate,
        totalDays: expulsionDays,
        status: 'PENDING',
      },
    });
  }
}
