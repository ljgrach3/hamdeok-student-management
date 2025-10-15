'use client';

import { useState, useEffect, FormEvent } from 'react';

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

    if (!grade || !classNum || !name) {
      setFormError('모든 필드를 입력해주세요.');
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

      // 폼 초기화 및 학생 목록 새로고침
      setGrade('');
      setClassNum('');
      setName('');
      fetchStudents();

    } catch (err) {
      setFormError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">학생 관리</h1>

      {/* 학생 추가 폼 */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">새 학생 추가</h2>
        <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">학년</label>
            <input
              type="number"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="예: 1"
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
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="예: 홍길동"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-10"
          >
            추가
          </button>
        </form>
        {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
      </div>

      {/* 학생 목록 테이블 */}
      <h2 className="text-2xl font-semibold mb-4">학생 목록</h2>
      {isLoading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">학년</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">반</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">이름</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-4 px-6 whitespace-nowrap">{student.grade}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{student.classNum}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{student.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
