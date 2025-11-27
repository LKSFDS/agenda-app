import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import dailyRoutes from './routes/daily';
import financeRoutes from './routes/finances';
import calendarRoutes from './routes/calendar';


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/calendar', calendarRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor rodando!',
    timestamp: new Date().toISOString()
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Agenda - Bem vindo!',
    endpoints: {
      tasks: '/api/tasks',
      finances: '/api/finances',
      health: '/health'
    }
  });
});

export default app;