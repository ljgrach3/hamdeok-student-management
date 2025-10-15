import { PrismaClient, Student, Demerit, Warning, Expulsion } from '@prisma/client';
import { notFound } from 'next/navigation';
import StudentCalendar from './StudentCalendar'; // 학생 달력 컴포넌트 import

const prisma = new PrismaClient();

async function getStudentData(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        demerits: { orderBy: { date: 'desc' } },
        warnings: { orderBy: { date: 'desc' } },
        expulsions: { orderBy: { createdAt: 'desc' } },
      },
    });
    return student;
  } catch (error) {
    console.error("Failed to fetch student data:", error);
    return null;
  }
}

export default async function StudentDashboardPage({ params }: { params: { id: string } }) {
  const student = await getStudentData(params.id);

  if (!student) {
    notFound();
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthDemerits = student.demerits.filter(d => new Date(d.date) >= startOfMonth);
  const totalPoints = currentMonthDemerits.reduce((sum, d) => sum + d.points, 0);
  const activeExpulsion = student.expulsions.find(e => e.status === 'ACTIVE' || e.status === 'PENDING');

  // activeExpulsion 타입을 명확히 지정
  function getExpulsionStatus(totalPoints: number, activeExpulsion: (Expulsion | undefined)) {
    if (activeExpulsion) {
        if (activeExpulsion.status === 'PENDING') return { text: '퇴출 예정', color: 'text-yellow-500' };
        if (activeExpulsion.status === 'ACTIVE') return { text: '퇴출 진행중', color: 'text-red-600' };
    }
    if (totalPoints >= 5) {
        return { text: '퇴출 예정', color: 'text-yellow-500' };
    }
    return { text: '안전', color: 'text-green-500' };
  }
  const expulsionStatus = getExpulsionStatus(totalPoints, activeExpulsion);


  return (
    <main className="container mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{student.name} 학생 대시보드</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{student.grade}학년 {student.classNum}반</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* 내 정보 */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">요약</h2>
          <div className="space-y-3">
            <p><strong>이번 달 누적 벌점:</strong> {totalPoints}점</p>
            <p><strong>퇴출 상태:</strong> <span className={`font-bold ${expulsionStatus.color}`}>{expulsionStatus.text}</span></p>
            {activeExpulsion && (
              <p><strong>퇴출 기간:</strong> {new Date(activeExpulsion.startDate).toLocaleDateString()} ~ {new Date(activeExpulsion.endDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* 벌점 기록 */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">최근 벌점 기록</h2>
          <div className="overflow-y-auto max-h-60">
            {student.demerits.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {student.demerits.map(demerit => (
                  <li key={demerit.id} className="py-3">
                    <div className="flex justify-between">
                      <span>{new Date(demerit.date).toLocaleDateString()}</span>
                      <span className="font-bold text-red-500">-{demerit.points}점</span>
                    </div>
                    <p className="text-sm text-gray-500">{demerit.reason}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>벌점 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 달력 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">내 기록 달력</h2>
        <StudentCalendar demerits={student.demerits} expulsions={student.expulsions} />
      </div>
    </main>
  );
}
