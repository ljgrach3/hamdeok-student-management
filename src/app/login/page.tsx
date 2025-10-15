'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentLoginPage() {
  const [grade, setGrade] = useState('');
  const [classNum, setClassNum] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!grade || !classNum || !name) {
      setError('학년, 반, 이름을 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/login/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade, classNum, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // 로그인 성공 시 학생 대시보드로 이동
      router.push(`/dashboard/student/${data.id}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          학생 로그인
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">학년</label>
            <input
              id="grade"
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="학년을 입력하세요"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="classNum" className="block text-sm font-medium text-gray-700 dark:text-gray-300">반</label>
            <input
              id="classNum"
              type="number"
              value={classNum}
              onChange={(e) => setClassNum(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="반을 입력하세요"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="이름을 입력하세요"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
