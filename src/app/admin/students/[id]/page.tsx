import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Demerit, Warning, Expulsion } from '@prisma/client'; // Ensure these are imported if used in types

const prisma = new PrismaClient();

async function getStudentDetails(studentId: string) {
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
    console.error("Failed to fetch student details:", error);
    return null;
  }
}

// Explicitly define the expected props structure for a dynamic route page
interface PageProps {
  params: {
    id: string;
  };
  // searchParams?: { [key: string]: string | string[] | undefined }; // searchParams 제거
}

export default async function StudentDetailPage({ params }: PageProps) { // PageProps 사용
  const student = await getStudentDetails(params.id);

  if (!student) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">
          {student.grade}학년 {student.classNum}반 {student.name} 학생 상세 정보
        </h2>
        <Link href="/admin/students" className="text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          <p><strong>학년:</strong> {student.grade}</p>
          <p><strong>반:</strong> {student.classNum}</p>
          <p><strong>이름:</strong> {student.name}</p>
          <p><strong>등록일:</strong> {new Date(student.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* 벌점 이력 */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">벌점 이력</h3>
        {student.demerits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">벌점</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">사유</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">부여자</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {student.demerits.map((demerit) => (
                  <tr key={demerit.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(demerit.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-500 font-bold">-{demerit.points}점</td>
                    <td className="px-6 py-4 whitespace-nowrap">{demerit.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{demerit.assigner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>벌점 이력이 없습니다.</p>
        )}
      </div>

      {/* 경고 이력 */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">경고 이력</h3>
        {student.warnings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">사유</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {student.warnings.map((warning) => (
                  <tr key={warning.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(warning.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{warning.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>경고 이력이 없습니다.</p>
        )}
      </div>

      {/* 퇴출 이력 */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">퇴출 이력</h3>
        {student.expulsions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">시작일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">종료일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">총 일수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {student.expulsions.map((expulsion) => (
                  <tr key={expulsion.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(expulsion.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(expulsion.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expulsion.totalDays}일</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expulsion.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>퇴출 이력이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
