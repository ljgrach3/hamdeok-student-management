import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          함덕고등학교 음악과 학생 관리
        </h1>
        <p className="text-md md:text-lg text-gray-600 dark:text-gray-400 mb-10">
          로그인 유형을 선택해주세요.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link href="/login" legacyBehavior>
            <a className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
              학생 로그인
            </a>
          </Link>
          <Link href="/admin/login" legacyBehavior>
            <a className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gray-700 rounded-lg shadow-md hover:bg-gray-800 transition-transform transform hover:scale-105">
              관리자 로그인
            </a>
          </Link>
        </div>
      </div>
    </main>
  );
}
