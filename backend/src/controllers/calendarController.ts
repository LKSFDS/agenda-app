import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const calendarController = {
  async getMonthlyEvents(req: Request, res: Response) {
    try {
      const year = Number(req.query.year);
      const month = Number(req.query.month);

      // @ts-ignore
      const userId = req.userId;

      if (!year || !month) {
        return res.status(400).json({ error: "Ano e mês são obrigatórios" });
      }

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);

      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end
          }
        }
      });

      // FullCalendar espera "title" e "date"
      const formatted = events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date.toISOString().split("T")[0],
        allDay: event.allDay,
        type: event.type,
      }));

      res.json(formatted);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar eventos do mês" });
    }
  },

  async createEvent(req: Request, res: Response) {
    try {
      const { title, description, date, allDay, type } = req.body;

      // @ts-ignore
      const userId = req.userId;

      if (!title || !date) {
        return res.status(400).json({ error: "Título e data são obrigatórios" });
      }

      const event = await prisma.calendarEvent.create({
        data: {
          title,
          description: description || null,
          date: new Date(date),
          allDay: allDay ?? true,
          type: type ?? "PERSONAL",
          userId
        }
      });

      res.status(201).json(event);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar evento no calendário" });
    }
  },
};
