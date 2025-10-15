'use client';

import { useState, useEffect, FormEvent } from 'react';

type Student = {
  id: string;
  grade: number;
  classNum: number;
  name: string;
};

export default function DemeritPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const assigner = 'admin'; // setAssigner 제거
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 폼 제출 로딩 상태

  // 모든 학생 목록 불러오기 (드롭다운용)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error('Failed to fetch students', error);
      }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true); // 로딩 시작

    if (!selectedStudent || !points || !reason) {
      setMessage({ type: 'error', content: '모든 필드를 입력해주세요.' });
      setIsLoading(false);
      return;
    }

    // 확인 팝업 추가
    const studentName = students.find(s => s.id === selectedStudent)?.name || '선택된 학생';
    if (!window.confirm(`${studentName} 학생에게 벌점 ${points}점을 부여하시겠습니까? 사유: ${reason}`)) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/demerits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          points: Number(points),
          reason,
          assigner,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '벌점 부여에 실패했습니다.');
      }

      setMessage({ type: 'success', content: '벌점이 성공적으로 부여되었습니다.' });
      // 폼 초기화
      setSelectedStudent('');
      setPoints('');
      setReason('');

    } catch (err) {
      setMessage({ type: 'error', content: err instanceof Error ? err.message : '알 수 없는 오류 발생' });
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">벌점 부여</h2>
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="student" className="block text-sm font-medium text-gray-700 dark:text-gray-300">학생 선택</label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isLoading} // 로딩 중 비활성화
            >
              <option value="">학생을 선택하세요</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.grade}학년 {student.classNum}반 {student.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 dark:text-gray-300">벌점</label>
            <input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="벌점을 숫자로 입력"
              required
              disabled={isLoading} // 로딩 중 비활성화
            />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">벌점 사유</label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="벌점 사유를 구체적으로 입력"
              required
              disabled={isLoading} // 로딩 중 비활성화
            />
          </div>
          {message && (
            <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.content}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading} // 로딩 중 비활성화
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? '부여 중...' : '벌점 부여'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
