import FinanceTracker from './components/FinanceTracker';
import CalendarView from './components/CalendarView';
import React, { useEffect, useState } from 'react';
import DailyView from './components/DailyView';
import Auth from './components/Auth';
import { User } from './types';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'tasks' | 'finances' | 'calendar'>('tasks');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // 👈 NOVO

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="App">
      <header style={{ 
        backgroundColor: '#343a40', 
        color: 'white', 
        padding: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1>📅 Minha Agenda</h1>
          <small style={{ opacity: 0.8 }}>Olá, {user.name}</small>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <nav style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setCurrentView('tasks')}
              style={{ 
                backgroundColor: currentView === 'tasks' ? '#007bff' : 'transparent',
                color: 'white',
                border: '1px solid white',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📝 Visão Diária
            </button>
            <button 
              onClick={() => setCurrentView('calendar')}
              style={{ 
                backgroundColor: currentView === 'calendar' ? '#007bff' : 'transparent',
                color: 'white',
                border: '1px solid white',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📆 Calendário
            </button>
            <button 
              onClick={() => setCurrentView('finances')}
              style={{ 
                backgroundColor: currentView === 'finances' ? '#007bff' : 'transparent',
                color: 'white',
                border: '1px solid white',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💰 Finanças
            </button>
          </nav>

          <button
            onClick={handleLogout}
            style={{
              marginLeft: '1rem',
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main>
        {currentView === 'tasks' && (
          <DailyView selectedDate={selectedDate} /> /* 👈 passa o dia selecionado */
        )}
        {currentView === 'calendar' && (
          <CalendarView
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setCurrentView('tasks'); // abre a visão diária daquele dia
            }}
          />
        )}
        {currentView === 'finances' && <FinanceTracker />}
      </main>
    </div>
  );
}

export default App;
