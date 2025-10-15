'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link'; // Link 컴포넌트 import

// 학생 타입 정의
type Student = {
  id: string;
  grade: number;
  classNum: number;
  name: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 학생 추가 폼 상태
  const [grade, setGrade] = useState('');
  const [classNum, setClassNum] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false); // Loading state for add form

  // 학생 목록 불러오기
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/students');
      if (!res.ok) {
        throw new Error('데이터를 불러오는 데 실패했습니다.');
      }
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 학생 추가 핸들러
  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsAddingStudent(true); // Set loading for add form

    if (!grade || !classNum || !name) {
      setFormError('모든 필드를 입력해주세요.');
      setIsAddingStudent(false);
      return;
    }

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade, classNum, name }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || '학생 추가에 실패했습니다.');
      }

      setGrade('');
      setClassNum('');
      setName('');
      fetchStudents(); // Refresh list

    } catch (err) {
      setFormError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
    } finally {
      setIsAddingStudent(false); // Reset loading for add form
    }
  };

  // 학생 삭제 핸들러
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`${studentName} 학생을 정말로 삭제하시겠습니까? 관련된 모든 벌점, 경고, 퇴출 기록도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || '학생 삭제에 실패했습니다.');
      }

      alert(`${studentName} 학생이 성공적으로 삭제되었습니다.`);
      fetchStudents(); // Refresh list

    } catch (err) {
      alert(`학생 삭제 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">새 학생 추가</h2>
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">학년</label>
            <input
              type="number"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="예: 1"
              disabled={isAddingStudent}
            />
          </div>
          <div>
            <label htmlFor="classNum" className="block text-sm font-medium text-gray-700 dark:text-gray-300">반</label>
            <input
              type="number"
              id="classNum"
              value={classNum}
              onChange={(e) => setClassNum(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="예: 1"
              disabled={isAddingStudent}
            />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="예: 홍길동"
              disabled={isAddingStudent}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-10"
            disabled={isAddingStudent}
          >
            {isAddingStudent ? '추가 중...' : '추가'}
          </button>
        </form>
        {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
      </div>

      <h2 className="text-xl md:text-2xl font-semibold mb-4">학생 목록</h2>
      {isLoading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">학년</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">반</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">이름</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="py-4 px-6 whitespace-nowrap">{student.grade}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{student.classNum}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Link href={`/admin/students/${student.id}`} className="text-blue-600 hover:underline">
                        {student.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {students.map((student) => (
              <div key={student.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-2">
                  <Link href={`/admin/students/${student.id}`} className="text-lg font-semibold text-gray-900 dark:text-white hover:underline">
                    {student.name}
                  </Link>
                  <button
                    onClick={() => handleDeleteStudent(student.id, student.name)}
                    className="text-red-600 hover:text-red-900 font-medium text-sm"
                  >
                    삭제
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{student.grade}학년 {student.classNum}반</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
