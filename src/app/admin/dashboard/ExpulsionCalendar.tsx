'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { ko } from 'date-fns/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Student, Expulsion } from '@prisma/client';

// date-fns 로케일을 설정합니다. (한글)
const locales = {
  'ko': ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // 주 시작을 월요일로 설정
  getDay,
  locales,
});

interface ExpulsionEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Expulsion & { student: Student }; // 'any' 대신 명확한 타입 지정
}

interface ExpulsionCalendarProps {
  expulsions: (Expulsion & { student: Student })[];
}

export default function ExpulsionCalendar({ expulsions }: ExpulsionCalendarProps) {
  // Prisma 데이터를 react-big-calendar 이벤트 형식으로 변환
  const events: ExpulsionEvent[] = expulsions.map(expulsion => ({
    title: expulsion.student.name,
    start: new Date(expulsion.startDate),
    // react-big-calendar는 end 날짜를 포함하지 않으므로, 하루를 더해줍니다.
    end: new Date(new Date(expulsion.endDate).setDate(new Date(expulsion.endDate).getDate() + 1)),
    allDay: true,
    resource: expulsion,
  }));

  return (
    <div className="h-[600px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture='ko'
        components={{
          toolbar: () => null, // 툴바를 렌더링하지 않음
        }}
        messages={{
          next: "다음",
          previous: "이전",
          today: "오늘",
          month: "월",
          week: "주",
          day: "일",
          agenda: "목록",
          date: "날짜",
          time: "시간",
          event: "이벤트",
          noEventsInRange: "해당 기간에 이벤트가 없습니다.",
          showMore: total => `+${total} 더보기`
        }}
      />
    </div>
  );
}
