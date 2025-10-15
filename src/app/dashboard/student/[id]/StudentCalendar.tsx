'use client';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar'; // SlotInfo 제거
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import isSameDay from 'date-fns/isSameDay';
import ko from 'date-fns/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Demerit, Expulsion } from '@prisma/client';
import EventModal from './EventModal'; // 모달 컴포넌트 import

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
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [demeritsForDate, setDemeritsForDate] = useState<Demerit[]>([]);

  // 퇴출 기록만 이벤트로 변환
  const expulsionEvents: CalendarEvent[] = expulsions.map(expulsion => ({
    title: '퇴출',
    start: new Date(expulsion.startDate),
    end: new Date(new Date(expulsion.endDate).setDate(new Date(expulsion.endDate).getDate() + 1)),
    allDay: true,
    resource: { type: 'expulsion' },
  }));

  // 날짜 클릭 핸들러
  const handleSelectSlot = (slotInfo: any) => { // SlotInfo 대신 any 사용 (임시)
    const clickedDate = slotInfo.start;
    const demeritsOnDate = demerits.filter(d => isSameDay(new Date(d.date), clickedDate));
    
    if (demeritsOnDate.length > 0) {
      setSelectedDate(clickedDate);
      setDemeritsForDate(demeritsOnDate);
      setModalOpen(true);
    }
  };

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
      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        demerits={demeritsForDate}
        date={selectedDate}
      />
      <div className="h-[600px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <Calendar
          localizer={localizer}
          events={expulsionEvents} // 퇴출 이벤트만 표시
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture='ko'
          selectable // 날짜 슬롯 선택 가능하도록 설정
          onSelectSlot={handleSelectSlot}
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