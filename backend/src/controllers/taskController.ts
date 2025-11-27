import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const taskController = {
  async getUserTasks(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.userId as string;

      const tasks = await prisma.task.findMany({
        where: { userId },
        orderBy: { dueDate: 'asc' }
      });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
  },

  async createTask(req: Request, res: Response) {
    try {
      const { title, description, dueDate, type } = req.body;
      // @ts-ignore
      const userId = req.userId as string;

      const task = await prisma.task.create({
        data: {
              title,
              description,
              dueDate: new Date(dueDate),
              type,
              userId
            }
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar tarefa' });
    }
  },

  async completeTask(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const task = await prisma.task.update({
        where: { id },
        data: { completed: true }
      });

      res.json(task);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao completar tarefa' });
    }
  },

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.task.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'Tarefa não encontrada' });
    }
  },

  async updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, dueDate, type, completed } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueDate = new Date(dueDate);
    if (type !== undefined) data.type = type;
    if (completed !== undefined) data.completed = completed;

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar tarefa' });
  }
},

};
