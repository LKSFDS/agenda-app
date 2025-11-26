# 📅 Minha Agenda — Full Stack Productivity App

Uma aplicação completa de **agenda pessoal**, com:

- ✔️ Visão diária (metas, tarefas, cronograma horário)  
- ✔️ Visão mensal (FullCalendar com eventos e compromissos)  
- ✔️ Controle financeiro mensal  
- ✔️ Autenticação com JWT  
- ✔️ Backend robusto com Prisma + PostgreSQL  

Tudo desenvolvido com **TypeScript**, **Express.js**, **Prisma** e **React**.

## 🚀 Funcionalidades

### 📝 Visão Diária
- 3 listas de tarefas com *drag & drop*:
  - 🌟 Metas do dia  
  - 🔥 Tarefas Importantes  
  - 🕒 Para Amanhã  
- Inputs rápidos que sempre completam 5 linhas
- Completar, mover ou deletar tarefa
- Cronograma completo (05:00 → 23:30)
- Criar compromissos com modal
- Exibir eventos all-day do dia selecionado

### 📆 Calendário Mensal
- Visualização FullCalendar
- Mostra eventos all-day
- Criar:
  - Evento (dia inteiro)
  - Compromisso com horário
- Ir direto para a visão diária de um dia

### 💰 Controle Financeiro
- Registrar receitas/despesas
- Resumo mensal automático:
  - total de receitas
  - total de despesas
  - saldo
- Listar últimas transações
- Deletar transações

### 🔐 Autenticação
- Registro e login com JWT
- Token salvo no localStorage
- Interceptor Axios adiciona automaticamente o token
- API inteira autenticada (exceto /auth)

## 🛠 Tecnologias

### Backend
- Node.js + TypeScript  
- Express.js  
- Prisma ORM  
- PostgreSQL (Docker)  
- JWT Auth  

### Frontend
- React + TypeScript  
- Axios  
- FullCalendar  
- @hello-pangea-dnd  

## 📁 Estrutura do Projeto

```plaintext
agenda-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── docker-compose.yml
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   └── public/
│
├── .gitignore
└── README.md
```

## 📌 Importante sobre o Banco de Dados

A pasta:

```
backend/postgres-data/
```

é o volume do Docker.  
❗ **Não deve ir para o Git.**

## 🚀 Como Rodar o Projeto

### 1. Pré-requisitos
- Node 18+
- Docker + Docker Compose
- npm ou yarn
- Porta 5432 livre

---

# ▶️ 2. Backend

### 2.1 Entrar na pasta
```bash
cd backend
```

### 2.2 Subir PostgreSQL
```bash
docker compose up -d
```

### 2.3 Criar `.env`
```env
DATABASE_URL="postgresql://agenda_user:senha123@localhost:5432/agenda_db?schema=public"
JWT_SECRET="uma_chave_secreta_muito_segura"
PORT=3001
```

### 2.4 Instalar dependências
```bash
npm install
```

### 2.5 Gerar Prisma Client
```bash
npx prisma generate
```

### 2.6 Aplicar migrações
```bash
npx prisma migrate dev
```

### 2.7 Rodar backend
```bash
npm run dev
```

---

# 💻 3. Frontend

### Instalar dependências
```bash
cd ../frontend
npm install
```

### Rodar
```bash
npm start
```

---

# 🔧 Comandos Úteis

```bash
npm run dev
docker compose up -d
docker compose down
npx prisma migrate dev
npx prisma studio
npm start
npm run build
```

---

# 👨‍💻 Autores
- Lucas — https://github.com/LKSFDS  
- Mateus — https://github.com/mtslopes13  
