import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers"; // AuthProvider import

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "함덕고등학교 학생 관리 시스템",
  description: "함덕고등학교 음악과 학생 관리 및 기록 조회 웹사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider> {/* SessionProvider 대신 AuthProvider 사용 */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
