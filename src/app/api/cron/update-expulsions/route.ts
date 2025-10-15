import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() { // request 매개변수 제거
  // 참고: 실제 서비스에서는 Vercel 환경 변수에 CRON_SECRET을 설정하고,
  // 아래 주석 처리된 코드를 활성화하여 허가되지 않은 접근을 막아야 합니다。
  /*
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  */

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 날짜 비교를 위해 시간 정보를 초기화합니다.

    // 1. 'PENDING' -> 'ACTIVE' 상태 변경
    // 퇴출 시작일이 오늘이거나 과거인 'PENDING' 상태의 퇴출 기록들을 'ACTIVE'로 변경합니다.
    const pendingToActive = await prisma.expulsion.updateMany({
      where: {
        status: 'PENDING',
        startDate: {
          lte: today,
        },
      },
      data: {
        status: 'ACTIVE',
      },
    });

    // 2. 'ACTIVE' -> 'COMPLETED' 상태 변경
    // 퇴출 종료일이 오늘보다 과거인 'ACTIVE' 상태의 퇴출 기록들을 'COMPLETED'로 변경합니다.
    const activeToCompleted = await prisma.expulsion.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: today,
        },
      },
      data: {
        status: 'COMPLETED',
      },
    });

    return NextResponse.json({
      message: 'Expulsion statuses updated successfully.',
      updatedToActive: pendingToActive.count,
      updatedToCompleted: activeToCompleted.count,
    });

  } catch (error) {
    console.error('Cron job for updating expulsions failed:', error);
    return NextResponse.json({ error: 'An error occurred while updating expulsion statuses.' }, { status: 500 });
  }
}
