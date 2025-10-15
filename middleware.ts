import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/admin/login', // 로그인 페이지 경로를 지정합니다.
  },
});

export const config = {
  matcher: ['/admin/:path*'], // '/admin' 경로 아래의 모든 페이지를 보호합니다.
};
