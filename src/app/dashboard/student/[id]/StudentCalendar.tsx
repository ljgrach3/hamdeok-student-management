'use client';

import { Calendar, dateFnsLocalizer, EventProps } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ko from 'date-fns/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Demerit, Expulsion } from '@prisma/client';

const locales = { 'ko': ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: { type: 'demerit' | 'expulsion' };
}

interface StudentCalendarProps {
  demerits: Demerit[];
  expulsions: Expulsion[];
}

export default function StudentCalendar({ demerits, expulsions }: StudentCalendarProps) {
  // 벌점 데이터를 달력 이벤트로 변환
  const demeritEvents: CalendarEvent[] = demerits.map(demerit => ({
    title: `벌점 ${demerit.points}점`,
    start: new Date(demerit.date),
    end: new Date(demerit.date),
    allDay: true,
    resource: { type: 'demerit' },
  }));

  // 퇴출 데이터를 달력 이벤트로 변환 (타이틀 수정)
  const expulsionEvents: CalendarEvent[] = expulsions.map(expulsion => ({
    title: '퇴출', // '퇴출 (상태)' 에서 '퇴출'로 변경
    start: new Date(expulsion.startDate),
    end: new Date(new Date(expulsion.endDate).setDate(new Date(expulsion.endDate).getDate() + 1)),
    allDay: true,
    resource: { type: 'expulsion' },
  }));

  const events = [...demeritEvents, ...expulsionEvents];

  // 이벤트 스타일 수정 (크기 축소)
  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.resource.type === 'demerit' ? '#ef4444' : '#f97316',
      borderRadius: '3px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '1px 4px', // 여백 축소
      fontSize: '0.75rem', // 글자 크기 축소
    };
    return { style };
  };

  return (
    <div className="h-[600px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture='ko'
        components={{ toolbar: () => null }} // 툴바 제거
        eventPropGetter={eventStyleGetter}
        messages={{
          today: "오늘",
          month: "월",
          noEventsInRange: "해당 기간에 기록이 없습니다.",
        }}
      />
    </div>
  );
}