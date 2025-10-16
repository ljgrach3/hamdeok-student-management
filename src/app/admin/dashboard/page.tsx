import { PrismaClient, Student, Expulsion } from '@prisma/client';
import ExpulsionCalendar from './ExpulsionCalendar'; // 달력 컴포넌트 import

// 데이터 가져오는 로직은 이전과 동일
async function getDashboardData() {
  const prisma = new PrismaClient();
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const demeritsThisMonth = await prisma.demerit.findMany({
      where: { issuedAt: { gte: startOfMonth, lte: endOfMonth } },
      include: { student: true },
    });

    const demeritSummary = demeritsThisMonth.reduce((acc, demerit) => {
      if (!acc[demerit.studentId]) {
        acc[demerit.studentId] = {
          student: demerit.student,
          totalPoints: 0,
        };
      }
      acc[demerit.studentId].totalPoints += demerit.score;
      return acc;
    }, {} as Record<string, { student: Student; totalPoints: number }>);

    const monthlyDemerits = Object.values(demeritSummary).sort((a, b) => b.totalPoints - a.totalPoints);

    const expulsions = await prisma.expulsion.findMany({
      where: { status: { in: ['PENDING', 'ACTIVE'] } },
      include: { student: true },
      orderBy: { startDate: 'asc' },
    });

    return { monthlyDemerits, expulsions };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { monthlyDemerits: [], expulsions: [] };
  }
}


export default async function AdminDashboardPage() {
  const { monthlyDemerits, expulsions } = await getDashboardData();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 이번달 벌점 현황 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">이번 달 벌점 현황</h2>
          <div className="overflow-y-auto max-h-[600px]">
            {monthlyDemerits.length > 0 ? (
              <table className="min-w-full">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-2 px-4 text-left">학생</th>
                    <th className="py-2 px-4 text-left">총 벌점</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyDemerits.map(({ student, totalPoints }) => (
                    <tr key={student.id} className="border-b dark:border-gray-700">
                      <td className="py-2 px-4">{student.grade}학년 {student.classNum}반 {student.name}</td>
                      <td className="py-2 px-4 font-bold">{totalPoints}점</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>이번 달 벌점 기록이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 퇴출 관리 달력 */}
        <div className="space-y-4">
           <h2 className="text-2xl font-semibold">퇴출 현황 달력</h2>
           <ExpulsionCalendar expulsions={expulsions as (Expulsion & { student: Student })[]} />
        </div>
      </div>
    </div>
  );
}
