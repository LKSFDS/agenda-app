import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarService, dailyService } from '../services/api';
import { CalendarEvent } from '../types';

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onSelectDate }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadEvents = async (year: number, month: number) => {
    try {
      const data = await calendarService.getMonthlyEvents(year, month);
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  };

  const handleDateClick = async (info: any) => {
    const action = window.prompt(
      `O que deseja fazer em ${info.dateStr}?\n` +
      `1 - Abrir visão diária\n` +
      `2 - Configurar evento (dia inteiro)\n` +
      `3 - Configurar compromisso com horário`
    );

    if (action === '1') {
      onSelectDate(info.date);
      return;
    }

    if (action === '2') {
      const title = window.prompt('Título do evento (dia inteiro):');
      if (!title) return;

      try {
        await calendarService.createEvent({
          title,
          date: info.dateStr,
          allDay: true,
        });
        loadEvents(info.date.getFullYear(), info.date.getMonth() + 1);
      } catch (err) {
        console.error('Erro ao criar evento:', err);
      }
      return;
    }

    if (action === '3') {
      const title = window.prompt('Título do compromisso:');
      if (!title) return;

      const defaultStart = '09:00';
      const startTime = window.prompt('Horário de início (HH:MM):', defaultStart) || defaultStart;
      const defaultEnd = '10:00';
      const endTime = window.prompt('Horário de término (HH:MM):', defaultEnd) || defaultEnd;

      try {
        await dailyService.createAppointment({
          title,
          date: info.dateStr,
          startTime,
          endTime,
        });
      } catch (err) {
        console.error('Erro ao criar compromisso:', err);
      }
    }
  };

  const handleMonthChange = (arg: any) => {
    const year = arg.view.currentStart.getFullYear();
    const month = arg.view.currentStart.getMonth() + 1;
    loadEvents(year, month);
  };

  useEffect(() => {
    const today = new Date();
    loadEvents(today.getFullYear(), today.getMonth() + 1);
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center' }}>📆 Calendário</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={selectedDate}
        events={events.map(e => ({
          title: e.title,
          date: e.date,
          allDay: e.allDay,
        }))}
        dateClick={handleDateClick}
        datesSet={handleMonthChange}
      />
    </div>
  );
};

export default CalendarView;
