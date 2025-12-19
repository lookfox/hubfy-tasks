# Hubfy Tasks

Aplicação web full stack para gerenciamento de tarefas, desenvolvida como desafio técnico para a Hubfy.ai.

O sistema permite que usuários se cadastrem, façam login e gerenciem suas próprias tarefas de forma segura, utilizando autenticação JWT.

---

## 🚀 Tecnologias Utilizadas

### Frontend
- Next.js 16
- React 18
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- JWT para autenticação
- Prisma ORM

### Banco de Dados
- MySQL 8+

---

## 📋 Funcionalidades

- Registro de usuários
- Login com autenticação JWT
- Proteção de rotas
- CRUD completo de tarefas
  - Criar tarefa
  - Listar tarefas do usuário
  - Editar tarefa
  - Deletar tarefa
- Cada usuário acessa apenas suas próprias tarefas
- Logout

---

## 🔐 Autenticação

- Autenticação via JWT (Bearer Token)
- Senhas armazenadas com hash seguro
- Tokens com expiração
- Middleware para proteção das rotas

---

## 🗂️ Estrutura de Pastas

src/
├── app/
│ ├── api/
│ │ ├── auth/
│ │ └── tasks/
│ ├── login/
│ ├── register/
│ └── dashboard/
├── lib/
│ ├── db.ts
│ ├── middleware.ts
│ ├── auth-client.ts
│ └── tasks-client.ts
└── types/
database/
└── schema.sql
src/
├── app/
│ ├── api/
│ │ ├── auth/
│ │ └── tasks/
│ ├── login/
│ ├── register/
│ └── dashboard/
├── lib/
│ ├── db.ts
│ ├── middleware.ts
│ ├── auth-client.ts
│ └── tasks-client.ts
└── types/
database/
└── schema.sql


---

## ⚙️ Pré-requisitos

- Node.js 18+
- MySQL 8+
- npm ou yarn

---

## 🛠️ Instalação e Execução

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/seu-usuario/hubfy-tasks.git
cd hubfy-tasks

**Instalar dependências** 

npm install

**Configurar variáveis de ambiente**

DATABASE_URL="mysql://user:password@localhost:3306/hubfy_tasks"
JWT_SECRET="sua_chave_secreta"


**Criar o banco de dados**

npx prisma migrate dev

*Rodar o projeto*

npm run dev

Acesse:

http://localhost:3000/login

http://localhost:3000/register

http://localhost:3000/dashboard


🧪 Testes Manuais Realizados

Registro de usuário

- Login com credenciais válidas e inválidas
- Criação, edição e exclusão de tarefas
- Proteção de rotas sem token
- Isolamento de dados por usuário

📌 Decisões Técnicas

- Utilização do Prisma para segurança contra SQL Injection
- Separação de responsabilidades entre API, client e UI
- Validação de dados com Zod
- Código tipado com TypeScript
- Commits semânticos e históricos claros

🔮 Melhorias Futuras

- Testes automatizados

- Paginação de tarefas

- Ordenação e busca

- Deploy em produção

- Dark mode persistente

👨‍💻 Autor

Daniel Anastacio da Silva
Desafio técnico — Hubfy.ai