import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dailyController = {
  async getDailyData(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: "É necessário enviar a data (YYYY-MM-DD)" });
      }

      const selectedDate = new Date(date as string);

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      // 1) Eventos "all-day"
      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          allDay: true
        }
      });

      // 2) Compromissos com horário
      const appointments = await prisma.appointment.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        }
      });

      return res.json({
        events,
        appointments
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao carregar cronograma diário" });
    }
  },

  async createAppointment(req: Request, res: Response) {
    try {
      const { title, date, startTime, endTime, description, location, eventId } = req.body;
      // @ts-ignore
      const userId = req.userId;

      if (!title || !date || !startTime || !endTime) {
        return res.status(400).json({ error: "Campos obrigatórios não preenchidos" });
      }

      const appointment = await prisma.appointment.create({
        data: {
          title,
          description,
          date: new Date(date),
          startTime,
          endTime,
          location,
          eventId,
          userId
        }
      });

      return res.status(201).json(appointment);

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar compromisso" });
    }
  }
};