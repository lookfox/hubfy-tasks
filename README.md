# Hubfy Tasks

Aplicação para gerenciamento de tarefas com autenticação JWT.

## Stack
Next.js (App Router), React, TypeScript, Tailwind, MySQL, Prisma, JWT, Jest/Supertest.

## Requisitos
- Node.js
- MySQL 8+

## Configuração
1. Clone o repositório e instale dependências:
   - npm install
2. Configure o banco MySQL e crie o database `hubfy_tasks`.
3. Crie um arquivo `.env` baseado em `.env.example`.
4. Rode as migrations:
   - npx prisma migrate dev
5. Suba a aplicação:
   - npm run dev

## Scripts
- `npm run dev`
- `npm test`
