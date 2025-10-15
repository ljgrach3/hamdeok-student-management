 'use client';
 
  import { useState, useEffect, FormEvent } from 'react';
  // import { Expulsion } from '@prisma/client'; // Expulsion import 제거
 
  type Student = {
    id: string;
    grade: number;
    classNum: number;
    name: string;
 };
 
 export default function WarningPage() {
   const [students, setStudents] = useState<Student[]>([]);
   const [selectedStudent, setSelectedStudent] = useState('');
   const [reason, setReason] = useState('');
   const assigner = 'admin'; // setAssigner 제거
 
   const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
   const [isLoading, setIsLoading] = useState(false);
 
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
     setIsLoading(true);

     if (!selectedStudent || !reason) {
       setMessage({ type: 'error', content: '학생과 경고 사유를 모두 입력해주세요.' });
       setIsLoading(false);
       return;
     }

     // 확인 팝업 추가
     const studentName = students.find(s => s.id === selectedStudent)?.name || '선택된 학생';
     if (!window.confirm(`${studentName} 학생에게 경고를 부여하시겠습니까? 사유: ${reason}`)) {
       setIsLoading(false);
       return;
     }

     try {
       const res = await fetch('/api/warnings', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           studentId: selectedStudent,
           reason,
           assigner,
         }),
       });

       const data = await res.json();
       if (!res.ok) {
         throw new Error(data.error || '경고 부여에 실패했습니다.');
       }

       setMessage({ type: 'success', content: '경고가 성공적으로 부여되었습니다. 2회 누적 시 벌점으로 자동 전환됩니다.' });
       // 폼 초기화
       setSelectedStudent('');
       setReason('');

     } catch (err) {
       setMessage({ type: 'error', content: err instanceof Error ? err.message : '알 수 없는 오류 발생' });
     } finally {
       setIsLoading(false);
     }
   };

   return (
     <div className="container mx-auto p-4 md:p-8">
       <h2 className="text-xl md:text-2xl font-semibold mb-4">경고 부여</h2>
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
               disabled={isLoading}
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
               <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">경고 사유</label>
               <textarea
                 id="reason"
                 rows={3}
                 value={reason}
                 onChange={(e) => setReason(e.target.value)}
                 className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                 placeholder="경고 사유를 구체적으로 입력"
                 required
                 disabled={isLoading}
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
                 disabled={isLoading}
                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400"
               >
                 {isLoading ? '부여 중...' : '경고 부여'}
               </button>
             </div>
           </form>
         </div>
       </div>
     );
   }