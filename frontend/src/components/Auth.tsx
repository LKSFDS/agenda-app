import React, { useState } from 'react';
import { authService } from '../services/api';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (token: string, user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const data = await authService.register(name, email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      } else {
        const data = await authService.login(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.error ||
        (mode === 'login'
          ? 'Erro ao fazer login. Verifique suas credenciais.'
          : 'Erro ao registrar. Tente novamente.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>📅 Minha Agenda</h1>
        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderBottom: mode === 'login' ? '3px solid #007bff' : '1px solid #ccc',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: mode === 'login' ? 'bold' : 'normal'
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderBottom: mode === 'register' ? '3px solid #007bff' : '1px solid #ccc',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: mode === 'register' ? 'bold' : 'normal'
            }}
          >
            Cadastrar
          </button>
        </div>

        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === 'register'}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'default' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading
              ? 'Carregando...'
              : mode === 'login'
              ? 'Entrar'
              : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
