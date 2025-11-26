import axios from 'axios';
import { DailyData, Appointment } from "../types";
import { Task, Finance, MonthlySummary, AuthResponse, TaskType, CalendarEvent } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// adiciona interceptor pra enviar o token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serviço de Tarefas
export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },
  
  async createTask(taskData: { title: string; dueDate: string; type: TaskType; description?: string }): Promise<Task> {
    const response = await api.post<Task>('/tasks', taskData);
    return response.data;
  },
  
  async completeTask(id: string): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}/complete`);
    return response.data;
  },
  
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async updateTask(
    id: string,
    data: Partial<{ title: string; description: string; dueDate: string; type: TaskType; completed: boolean }>
  ): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },
};

// Serviço de Finanças
export const financeService = {
  async getFinances(): Promise<Finance[]> {
    const response = await api.get<Finance[]>('/finances');
    return response.data;
  },
  
  async getMonthlyStatement(year?: number, month?: number): Promise<MonthlySummary> {
    const response = await api.get<MonthlySummary>('/finances/monthly', { 
      params: { year, month } 
    });
    return response.data;
  },
  
  async addTransaction(transactionData: any): Promise<Finance> {
    const response = await api.post<Finance>('/finances', transactionData);
    return response.data;
  },
  
  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/finances/${id}`);
  },
};

// Serviço de Autenticação
export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
};

// Serviço de Calendário
export const calendarService = {
  async getMonthlyEvents(year: number, month: number): Promise<CalendarEvent[]> {
    const response = await api.get<CalendarEvent[]>('/calendar/events', {
      params: { year, month }
    });
    return response.data; // agora o TS sabe que é CalendarEvent[]
  },

  async createEvent(eventData: {
    title: string;
    date: string;
    allDay: boolean;
    description?: string;
    type?: string;
  }): Promise<CalendarEvent> {
    const response = await api.post<CalendarEvent>('/calendar/events', eventData);
    return response.data;
  }
};

export const dailyService = {
  async getDailyData(date: string): Promise<DailyData> {
    const res = await api.get<DailyData>('/daily', {
      params: { date }
    });
    return res.data;
  },

  async createAppointment(data: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    eventId?: string;
  }): Promise<Appointment> {
    const res = await api.post<Appointment>('/daily/appointment', data);
    return res.data;
  }
};