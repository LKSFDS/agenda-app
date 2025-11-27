// ENTIDADES PRINCIPAIS

export type TaskType = 'META' | 'IMPORTANTE' | 'AMANHA';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  type: TaskType;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Finance {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
  userId: string;
  createdAt: string;
}

export interface MonthlySummary {
  transactions: Finance[];
  totals: {
    income: number;
    expenses: number;
  };
  balance: number;
}

// USUÁRIO E AUTENTICAÇÃO (ADICIONADO)

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// TIPO GENÉRICO DE API (se ainda for usar)

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  userId: string;
  eventId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  allDay: boolean;
  type: string;
  userId?: string;
}

export interface DailyData {
  events: CalendarEvent[];
  appointments: Appointment[];
}
