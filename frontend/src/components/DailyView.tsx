import React, { useEffect, useState } from 'react';
import { Task, TaskType, Appointment, CalendarEvent } from '../types';
import { taskService, dailyService } from '../services/api';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';

const LIST_TYPES: { type: TaskType; label: string; emoji: string }[] = [
  { type: 'META',        label: 'Metas do Dia',        emoji: '🌟' },
  { type: 'IMPORTANTE',  label: 'Tarefas Importantes', emoji: '🔥' },
  { type: 'AMANHA',      label: 'Para Amanhã',         emoji: '🕒' },
];

type NewTasksState = {
  [K in TaskType]: string[];
};

const initialNewTasks: NewTasksState = {
  META: Array(5).fill(''),
  IMPORTANTE: Array(5).fill(''),
  AMANHA: Array(5).fill(''),
};

// Coluna 1: 05:00 até 14:00
const COLUMN1_HOURS = [
  '05:00','05:30','06:00','06:30',
  '07:00','07:30','08:00','08:30',
  '09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30',
  '13:00','13:30','14:00'
];

// Coluna 2: 14:30 até 23:30
const COLUMN2_HOURS = [
  '14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30',
  '19:00','19:30','20:00','20:30',
  '21:00','21:30','22:00','22:30',
  '23:00','23:30'
];

interface DailyViewProps {
  selectedDate: Date;
}

const DailyView: React.FC<DailyViewProps> = ({ selectedDate }) => {
  // Tarefas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTasks, setNewTasks] = useState<NewTasksState>(initialNewTasks);

  // Cronograma
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);

  // Modal de compromisso
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartTime, setModalStartTime] = useState('');
  const [modalEndTime, setModalEndTime] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalLocation, setModalLocation] = useState('');

  const formatDateParam = (d: Date) => d.toISOString().split('T')[0];

  // ==== TAREFAS (ESQUERDA) ====

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Erro ao carregar tarefas', err);
    }
  };

  useEffect(() => {
    setNewTasks(prev => {
      const copy: NewTasksState = { ...prev };
      const allTypes: TaskType[] = ['META', 'IMPORTANTE', 'AMANHA'];

      allTypes.forEach(type => {
        const countTasksOfType = tasks.filter(t => t.type === type).length;

        const desiredInputs =
          countTasksOfType < 5
            ? 5 - countTasksOfType
            : 1;

        let arr = copy[type] || [];

        if (arr.length < desiredInputs) {
          arr = [...arr, ...Array(desiredInputs - arr.length).fill('')];
        } else if (arr.length > desiredInputs) {
          arr = arr.slice(0, desiredInputs);
        }

        copy[type] = arr;
      });

      return copy;
    });
  }, [tasks]);

  const handleNewTaskChange = (type: TaskType, index: number, value: string) => {
    setNewTasks(prev => {
      const copy = { ...prev };
      const arr = [...copy[type]];
      arr[index] = value;
      copy[type] = arr;
      return copy;
    });
  };

  const handleNewTaskKeyDown = async (type: TaskType, index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;

    const title = newTasks[type][index].trim();
    if (!title) return;

    try {
      await taskService.createTask({
        title,
        dueDate: new Date().toISOString(),
        type,
      });
      await loadTasks();
      setNewTasks(prev => {
        const copy = { ...prev };
        const arr = [...copy[type]];
        arr[index] = '';
        copy[type] = arr;
        return copy;
      });
    } catch (err) {
      console.error('Erro ao criar tarefa', err);
    }
  };

  const handleToggleCompleted = async (task: Task) => {
    try {
      await taskService.updateTask(task.id, { completed: !task.completed });
      await loadTasks();
    } catch (err) {
      console.error('Erro ao atualizar tarefa', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Erro ao deletar tarefa', err);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromType = source.droppableId as TaskType;
    const toType = destination.droppableId as TaskType;

    if (fromType === toType && destination.index === source.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    if (fromType !== toType) {
      try {
        await taskService.updateTask(task.id, { type: toType });
        await loadTasks();
      } catch (err) {
        console.error('Erro ao mover tarefa', err);
      }
    }
  };

  const tasksByType: { [K in TaskType]: Task[] } = {
    META: tasks.filter(t => t.type === 'META'),
    IMPORTANTE: tasks.filter(t => t.type === 'IMPORTANTE'),
    AMANHA: tasks.filter(t => t.type === 'AMANHA'),
  };

  // ==== CRONOGRAMA (DIREITA) ====

  const loadDailyData = async () => {
    try {
      setLoadingDaily(true);
      const data = await dailyService.getDailyData(formatDateParam(selectedDate));
      setEvents(data.events);
      setAppointments(data.appointments);
    } catch (err) {
      console.error('Erro ao carregar dados do dia', err);
    } finally {
      setLoadingDaily(false);
    }
  };

  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  const openAppointmentModal = (startTime: string) => {
    setModalStartTime(startTime);

    const [h, m] = startTime.split(':').map(Number);
    const end = new Date();
    end.setHours(h, m + 30);
    const endStr = end.toTimeString().substring(0, 5);

    setModalEndTime(endStr);
    setModalTitle('');
    setModalLocation('');
    setIsModalOpen(true);
  };

  const handleCreateAppointment = async () => {
    if (!modalTitle.trim()) {
      alert('Dê um título ao compromisso.');
      return;
    }

    try {
      await dailyService.createAppointment({
        title: modalTitle,
        date: formatDateParam(selectedDate),
        startTime: modalStartTime,
        endTime: modalEndTime,
        location: modalLocation || undefined,
      });
      setIsModalOpen(false);
      await loadDailyData();
    } catch (err) {
      console.error('Erro ao criar compromisso', err);
    }
  };

  const parseTimeToMinutes = (time: string): number | null => {
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const appointmentsAtSlot = (slot: string) => {
    const slotStart = parseTimeToMinutes(slot);
    if (slotStart === null) return [];
    const slotEnd = slotStart + 30;

    return appointments.filter(a => {
      const t = parseTimeToMinutes(a.startTime);
      if (t === null) return false;
      return t >= slotStart && t < slotEnd;
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>📅 {selectedDate.toLocaleDateString()}</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 2fr',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        {/* ESQUERDA: LISTAS DE TAREFAS */}
        <div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {LIST_TYPES.map(list => (
                <Droppable droppableId={list.type} key={list.type}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        backgroundColor: snapshot.isDraggingOver ? '#f0f8ff' : '#f8f9fa',
                        minHeight: 200,
                      }}
                    >
                      <h3 style={{ marginBottom: 10 }}>
                        {list.emoji} {list.label}
                      </h3>

                      {tasksByType[list.type].map((task, index) => (
                        <Draggable draggableId={task.id} index={index} key={task.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 10px',
                                marginBottom: 8,
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                backgroundColor: snapshot.isDragging ? '#e2e6ea' : 'white',
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => handleToggleCompleted(task)}
                                />
                                <span
                                  style={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? '#6c757d' : 'inherit',
                                  }}
                                >
                                  {task.title}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {newTasks[list.type].map((value, index) => (
                        <div key={`new-${list.type}-${index}`} style={{ marginBottom: 6 }}>
                          <input
                            type="text"
                            placeholder="Adicionar..."
                            value={value}
                            onChange={(e) => handleNewTaskChange(list.type, index, e.target.value)}
                            onKeyDown={(e) => handleNewTaskKeyDown(list.type, index, e)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 4,
                              border: '1px dashed #ccc',
                              fontSize: '0.9rem',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>

        {/* DIREITA: CRONOGRAMA */}
        <div>
          {/* Eventos do dia (all-day) */}
          {events.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <h4>Eventos do dia</h4>
              {events.map(ev => (
                <div
                  key={ev.id}
                  style={{
                    background: '#eaf6ff',
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid #b5d9ff',
                    marginBottom: 4,
                  }}
                >
                  {ev.title}
                </div>
              ))}
            </div>
          )}

          {/* Grade 2 colunas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: 8,
            }}
          >
            {/* Coluna 1 */}
            <div>
              <div>
                {COLUMN1_HOURS.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => openAppointmentModal(hour)}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid #eee',
                      minHeight: 32,
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ fontSize: '0.8rem', opacity: 0.7 }}>{hour}</strong>

                    {appointmentsAtSlot(hour).map((a) => (
                      <div
                        key={a.id}
                        style={{
                          marginTop: 4,
                          background: '#d6ffe3',
                          border: '1px solid #92e6a7',
                          padding: '4px 6px',
                          borderRadius: 4,
                          fontSize: '0.8rem',
                        }}
                      >
                        {a.title} ({a.startTime} - {a.endTime})
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 2 */}
            <div>
              <div>
                {COLUMN2_HOURS.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => openAppointmentModal(hour)}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid #eee',
                      minHeight: 32,
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ fontSize: '0.8rem', opacity: 0.7 }}>{hour}</strong>

                    {appointmentsAtSlot(hour).map((a) => (
                      <div
                        key={a.id}
                        style={{
                          marginTop: 4,
                          background: '#d6ffe3',
                          border: '1px solid #92e6a7',
                          padding: '4px 6px',
                          borderRadius: 4,
                          fontSize: '0.8rem',
                        }}
                      >
                        {a.title} ({a.startTime} - {a.endTime})
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {loadingDaily && (
            <p style={{ marginTop: 8, fontSize: '0.85rem', opacity: 0.7 }}>
              Carregando cronograma...
            </p>
          )}
        </div>
      </div>

      {/* Modal simples de criação de compromisso */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 20,
              borderRadius: 8,
              minWidth: 300,
              maxWidth: 400,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Novo compromisso</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              Dia {selectedDate.toLocaleDateString()} – horário base {modalStartTime}
            </p>

            <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
              <input
                type="text"
                placeholder="Título"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                style={{
                  padding: 6,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem' }}>Início (HH:MM)</label>
                  <input
                    type="text"
                    value={modalStartTime}
                    onChange={(e) => setModalStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 6,
                      borderRadius: 4,
                      border: '1px solid #ccc',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem' }}>Fim (HH:MM)</label>
                  <input
                    type="text"
                    value={modalEndTime}
                    onChange={(e) => setModalEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 6,
                      borderRadius: 4,
                      border: '1px solid #ccc',
                    }}
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Local (opcional)"
                value={modalLocation}
                onChange={(e) => setModalLocation(e.target.value)}
                style={{
                  padding: 6,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  background: '#f8f9fa',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAppointment}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyView;
