💳 Controle de Gastos

Este projeto é uma API desenvolvida com NestJS para controle de gastos com cartões de crédito. Ele utiliza PostgreSQL hospedado no Supabase como banco de dados e está implantado no Render.

🚀 Tecnologias Utilizadas

NestJS - Framework para Node.js

Prisma - ORM para interagir com o PostgreSQL

Supabase - Banco de dados PostgreSQL gerenciado

Render - Plataforma de deploy

🏗 Estrutura do Projeto

Backend: Desenvolvido com NestJS e Prisma

Banco de Dados: PostgreSQL no Supabase

Autenticação: Supabase Auth

Deploy: Feito na plataforma Render

🔧 Configuração do Ambiente

Clone o repositório:

git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

Instale as dependências:

npm install

Configure o arquivo .env com suas credenciais:

DATABASE_URL=postgresql://seu-usuario:senha@host:porta/banco

Execute as migrações do banco de dados:

npx prisma db push

Inicie o servidor localmente:

npm run start:dev

🌍 Deploy no Render

O projeto está configurado para deploy automático no Render. Após cada push na branch principal, o Render executa automaticamente o build e reinicia o servidor.

Caso precise rodar manualmente:

npm run build && npm run start:prod

🛠 Tecnologias Futuras

Dashboard com gráficos

Integração com OpenAI para insights financeiros

Desenvolvido por Felippe Fernandes🚀
