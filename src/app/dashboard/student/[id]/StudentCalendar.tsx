'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import isSameDay from 'date-fns/isSameDay';
import ko from 'date-fns/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Expulsion, Demerit } from '@prisma/client'; // 필요한 타입만 남김
// import EventModal from './EventModal'; // 이 줄을 제거합니다.

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


  // 퇴출 기록만 이벤트로 변환
  const expulsionEvents: CalendarEvent[] = expulsions.map(expulsion => ({
    title: '퇴출',
    start: new Date(expulsion.startDate),
    end: new Date(new Date(expulsion.endDate).setDate(new Date(expulsion.endDate).getDate() + 1)),
    allDay: true,
    resource: { type: 'expulsion' },
  }));

  // 날짜 클릭 핸들러 (제거)
  // const handleSelectSlot = (slotInfo: any) => {
  //   const clickedDate = slotInfo.start;
  //   const demeritsOnDate = demerits.filter(d => isSameDay(new Date(d.date), clickedDate));
    
  //   if (demeritsOnDate.length > 0) {
  //     setSelectedDate(clickedDate);
  //     setDemeritsForDate(demeritsOnDate);
  //     setModalOpen(true);
  //   }
  // };

  // 날짜 셀에 벌점 점(dot) 표시
  const CustomDateCellWrapper = ({ children, value }: { children: React.ReactNode, value: Date }) => {
    const hasDemerit = demerits.some(d => isSameDay(new Date(d.date), value));
    return (
      <div className="relative h-full">
        {children}
        {hasDemerit && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
      </div>
    );
  };

  return (
    <>
      {/* EventModal 컴포넌트 렌더링 부분도 제거합니다. */}
      {/* <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        demerits={demeritsForDate}
        date={selectedDate}
      /> */}
      <div className="h-[600px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <Calendar
          localizer={localizer}
          events={expulsionEvents} // 퇴출 이벤트만 표시
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture='ko'
          // selectable // 날짜 슬롯 선택 가능하도록 설정 (제거)
          // onSelectSlot={handleSelectSlot} (제거)
          components={{ 
            toolbar: () => null,
            dateCellWrapper: CustomDateCellWrapper // 커스텀 날짜 셀 래퍼 적용
          }}
          eventPropGetter={() => ({ style: { backgroundColor: '#f97316', borderRadius: '3px', opacity: 0.8, color: 'white', border: '0px' } })}
          messages={{ today: "오늘", month: "월", noEventsInRange: "해당 기간에 기록이 없습니다." }}
        />
      </div>
    </>
  );
}