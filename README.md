# Sistema de Gestao Empresarial

Sistema ERP/CRM com frontend em React, backend em Node.js/Express e banco MySQL.

## Estrutura

- `components/`: telas e componentes visuais
- `services/`: cliente da API
- `backend/`: API, Prisma e conexao com MySQL
- `backend/prisma/`: schema e seed do banco

## Requisitos

- Node.js 18+
- Git
- XAMPP com MySQL

## Banco de dados

O sistema usa um banco local chamado `erp_crm`.

Passos:

1. Abrir o XAMPP
2. Iniciar o MySQL
3. Criar o banco `erp_crm`
4. Ajustar `backend/.env` se o usuario ou senha do MySQL forem diferentes

Exemplo:

```env
DATABASE_URL="mysql://root:@localhost:3306/erp_crm"
```

## Arquivos de ambiente

Criar a partir dos exemplos:

- `.env`
- `backend/.env`

Frontend:

```env
VITE_API_URL=http://localhost:3002
```

Backend:

```env
DATABASE_URL="mysql://root:@localhost:3306/erp_crm"
JWT_SECRET="seu_jwt_secret_super_seguro_change_in_production_12345"
PORT=3002
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="admin"
```

## Instalacao

Na raiz:

```powershell
npm install
```

No backend:

```powershell
cd backend
npm install
```

## Como rodar

Abra 2 terminais.

Terminal 1:

```powershell
cd backend
npm run dev
```

Terminal 2:

```powershell
npm run dev
```

Abrir no navegador:

```text
http://localhost:5173
```

## Login padrao

```text
Email: admin@admin.com
Senha: admin
```

Se o admin nao existir:

```powershell
cd backend
npm run db:seed
```

## Build

Frontend:

```powershell
npm run build
```

Backend:

```powershell
cd backend
npm run build
```

## Como o sistema funciona

1. O frontend React chama `services/api.ts`
2. A API roda em `http://localhost:3002`
3. O backend usa Prisma para acessar o MySQL
4. O MySQL devolve os dados para o backend
5. O backend responde ao frontend

## Handoff para a proxima pessoa

- o frontend nao conecta direto no banco
- o banco precisa estar ligado no XAMPP antes de abrir o sistema
- se trocar a porta do backend, atualizar `VITE_API_URL`
- se trocar a porta do frontend, atualizar `FRONTEND_URL`
- se o banco vier vazio, rodar `npm run db:seed` dentro de `backend`
