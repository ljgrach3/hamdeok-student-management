'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 임시 로그인 로직
    // 실제로는 여기에서 /api/admin/login 같은 API를 호출합니다.
    if (username === 'admin' && password === 'password') {
      alert('관리자 로그인 성공! (임시) 관리자 대시보드로 이동합니다.');
      router.push('/admin/dashboard'); // 관리자 대시보드 경로
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          관리자 로그인
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">아이디</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
