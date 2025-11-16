# 💳 Credit Card Planner - API Backend



<div align="center">



![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)



**Uma API REST robusta para gerenciamento de despesas com múltiplos cartões de crédito e previsão financeira**



[Funcionalidades](#-funcionalidades) • [Stack Tecnológica](#-stack-tecnológica) • [Começando](#-começando) • [Documentação da API](#-documentação-da-api) • [Arquitetura](#-arquitetura) • [Deploy](#-deploy)



</div>



---



## 📋 Visão Geral



O Credit Card Planner Backend é uma **API REST abrangente baseada em NestJS** projetada para gerenciar despesas em múltiplos cartões de crédito com suporte para múltiplos usuários. O sistema permite que famílias e indivíduos rastreiem compras, gerenciem limites de cartão, prevejam faturas futuras e obtenham insights sobre padrões de gastos.



Este projeto serve como backend para o [Credit Card Planner Frontend](https://github.com/felippe-fernandes/credit_card_planner_frontend), fornecendo uma solução completa de gerenciamento financeiro full-stack.



### 🎯 Principais Destaques



- **Gerenciamento Multi-cartão**: Rastreie despesas em cartões de crédito ilimitados

- **Uso Compartilhado de Cartões**: Registre dependentes (membros da família) que compartilham cartões

- **Rastreamento Inteligente de Parcelas**: Cálculo automático das datas de parcelas baseado nos ciclos de pagamento do cartão

- **Previsão de Faturas**: Visualize faturas projetadas para qualquer mês futuro ou passado

- **Filtragem Avançada**: Filtre transações por cartão, dependente, categoria, intervalo de datas e mais

- **Controle de Acesso Baseado em Funções**: Funções USER, ADMIN e SUPER_ADMIN

- **Documentação Abrangente da API**: Documentação interativa Swagger/OpenAPI

- **Pronto para Produção**: Implantado no Render com deploy automático da branch main



---



## ✨ Funcionalidades



### 🏦 Gerenciamento de Cartões

- Crie e gerencie múltiplos cartões de crédito com configurações de pagamento personalizadas

- Rastreie limites de cartão, datas de vencimento e ciclos de pagamento

- Cálculo automático do limite disponível baseado em parcelas pendentes

- Suporte para limites simulados (cenários hipotéticos)



### 👥 Gerenciamento de Dependentes

- Registre membros da família ou outros usuários do cartão

- Rastreie qual dependente fez cada compra

- Filtre e analise gastos por dependente



### 💰 Rastreamento de Transações

- Registre compras com informações detalhadas (nome, categoria, valor, descrição)

- Suporte completo a parcelamento com valores personalizados por parcela

- Cálculo automático de qual fatura cada parcela pertence

- Previne transações duplicadas com restrições únicas



### 📊 Sistema de Faturas

- Geração automática de faturas mensais por cartão

- Visualize faturas para qualquer mês passado ou futuro

- Rastreamento de status de faturas (PENDENTE, PAGO, VENCIDO)

- Recálculo em massa de faturas sob demanda

- Cálculo de data de vencimento baseado na configuração do cartão



### 🏷️ Gerenciamento de Categorias

- Crie categorias de despesas personalizadas com ícones emoji e cores

- 5 categorias padrão criadas automaticamente no cadastro:

  - Alimentação 🍔

  - Transporte 🚗

  - Entretenimento 🎬

  - Saúde 🏥

  - Educação 📚



### 🔍 Filtragem Avançada e Relatórios

- Filtre transações por:

  - Cartão

  - Dependente

  - Categoria

  - Intervalo de datas

  - Nome da compra (busca)

  - Datas de parcelas (por mês da fatura)

- Respostas padronizadas da API com metadados de contagem

- Combinações abrangentes de consultas



### 🔐 Autenticação e Segurança

- Autenticação de sistema duplo (Supabase Auth + sincronização Prisma)

- Autenticação baseada em JWT com cookies HTTP-only

- Controle de acesso baseado em funções com guardas

- Configuração segura de cookies (httpOnly, secure, sameSite)



---



## 🛠 Stack Tecnológica



### Framework Core

- **[NestJS](https://nestjs.com/)** v11 - Framework progressivo Node.js

- **[TypeScript](https://www.typescriptlang.org/)** v5 - JavaScript com tipagem segura



### Banco de Dados e ORM

- **[Prisma](https://www.prisma.io/)** v6 - ORM de próxima geração

- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional

- **[Supabase](https://supabase.com/)** - PostgreSQL gerenciado com Auth



### Autenticação

- **[Supabase Auth](https://supabase.com/auth)** - Autenticação de usuários

- **[@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)** - Manipulação de JWT

- **[@nestjs/passport](https://www.npmjs.com/package/@nestjs/passport)** - Middleware de autenticação



### Documentação da API

- **[Swagger/OpenAPI](https://swagger.io/)** - Documentação interativa da API

- **[@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger)** - Integração Swagger



### Validação e Transformação

- **[class-validator](https://www.npmjs.com/package/class-validator)** - Validação de DTOs

- **[class-transformer](https://www.npmjs.com/package/class-transformer)** - Transformação de objetos



### Ferramentas de Desenvolvimento

- **[ESLint](https://eslint.org/)** - Linting de código

- **[Prettier](https://prettier.io/)** - Formatação de código

- **[Jest](https://jestjs.io/)** - Framework de testes



### Deploy

- **[Render](https://render.com/)** - Plataforma de hospedagem em nuvem



---



## 🏗 Arquitetura



### Organização de Módulos



O código segue uma **arquitetura modular baseada em funcionalidades** onde cada recurso é autocontido:



```

src/

├── auth/              # Autenticação e autorização

│   ├── guards/        # AuthGuard, RolesGuard

│   ├── decorators/    # Decoradores personalizados

│   └── dto/           # DTOs de autenticação

├── cards/             # Gerenciamento de cartões de crédito

├── categories/        # Categorias de despesas

├── dependents/        # Gerenciamento de usuários dependentes

├── invoice/           # Geração e consultas de faturas

├── transactions/      # Rastreamento de compras

├── user/              # Gerenciamento de perfil de usuário

├── common/            # DTOs e utilitários compartilhados

├── interceptors/      # Interceptadores de resposta e exceção

└── utils/             # Funções auxiliares

```



### Schema do Banco de Dados



O sistema usa **6 modelos principais** com relacionamentos bem definidos:



```

User (1) ──┬─→ (N) Card ──→ (N) Transaction ──→ (N) Invoice

           ├─→ (N) Dependent

           ├─→ (N) Category

           ├─→ (N) Transaction

           └─→ (N) Invoice

```



**Modelos Principais:**

1. **User** - Titulares de conta com RBAC (USER, ADMIN, SUPER_ADMIN)

2. **Card** - Cartões de crédito com rastreamento de limite e configuração de pagamento

3. **Transaction** - Compras com suporte a parcelamento

4. **Invoice** - Faturas mensais agregadas por cartão

5. **Category** - Categorias de despesas definidas pelo usuário

6. **Dependent** - Membros da família que usam os cartões



**Decisões de Design Importantes:**

- Todos os valores monetários usam tipo `Decimal` para prevenir erros de ponto flutuante

- Exclusões em cascata mantêm integridade referencial

- Restrições únicas previnem dados duplicados

- Índices otimizam performance de consultas



### Destaques da Lógica de Negócio



#### 🔄 Cálculo de Parcelas

O `TransactionsService` lida com lógica complexa de parcelamento:



```typescript

// Exemplo: Compra em 15 de janeiro com dia de pagamento do cartão no dia 10

// Data da compra: 15 de janeiro

// Primeira parcela: Fatura de 10 de fevereiro (10 de janeiro já passou)

// Segunda parcela: 10 de março

// Terceira parcela: 10 de abril, etc.

```



- Determina a qual fatura mensal cada parcela pertence

- Valida que os valores das parcelas somam o valor total

- Atualiza o `availableLimit` do cartão automaticamente

- Armazena datas de parcelas no formato MM/aaaa



#### 📈 Previsão de Faturas

O `InvoiceService` permite visualizar faturas em qualquer ponto no tempo:



- **calculateInvoices()** - Agrupa transações por cartão/mês/ano

- **upsertInvoices()** - Cria/atualiza faturas (previne duplicatas)

- **updateManyInvoices()** - Recálculo em massa

- Consulte faturas para meses futuros (1, 2, 6+ meses à frente)

- Visualize dados históricos de meses passados



### Padronização de Respostas



Todas as respostas da API seguem um formato consistente via `ResponseInterceptor`:



```json

{

  "success": true,

  "result": "<dados>",

  "message": "<resumo da operação>",

  "statusCode": 200,

  "count": "<número (opcional)>"

}

```



Respostas de erro usam `HttpExceptionFilter` para formatação consistente de erros.



---



## 🚀 Começando



### Pré-requisitos



- **Node.js** v18 ou superior

- **npm** v9 ou superior

- **PostgreSQL** (ou conta Supabase)

- Conta **Supabase** para autenticação



### Instalação



1. **Clone o repositório**



```bash

git clone https://github.com/felippe-fernandes/credit_card_planner_backend.git

cd credit_card_planner_backend

```



2. **Instale as dependências**



```bash

npm install

```



3. **Configure as variáveis de ambiente**



```bash

cp .env.example .env

```



Edite o `.env` e preencha suas credenciais:



```env

# Ambiente da aplicação

NODE_ENV=local



# Banco de dados (PostgreSQL Supabase)

DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"



# Supabase

SUPABASE_URL="https://[PROJECT-REF].supabase.co"

SUPABASE_ANON_KEY="sua-chave-anon"

SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"



# URL do Frontend (para CORS)

FRONTEND_URL="http://localhost:3000"



# Porta do Servidor

PORT=3001

```



4. **Envie o schema do banco de dados para o Supabase**



```bash

npx prisma db push

```



5. **Gere o Prisma Client**



```bash

npx prisma generate

```



6. **Inicie o servidor de desenvolvimento**



```bash

npm run start:dev

```



O servidor iniciará em `http://localhost:3001`



### 🗄️ Gerenciamento do Banco de Dados



```bash

# Abra o Prisma Studio (interface gráfica para o banco)

npx prisma studio



# Envie mudanças do schema para o banco

npx prisma db push



# Regenere o Prisma Client após mudanças no schema

npx prisma generate



# Formate o schema do Prisma

npx prisma format

```



### 🧪 Testes



```bash

# Execute testes unitários

npm run test



# Execute testes em modo watch

npm run test:watch



# Gere relatório de cobertura

npm run test:cov



# Execute testes E2E

npm run test:e2e



# Depure testes

npm run test:debug

```



### 🎨 Qualidade de Código



```bash

# Lint e corrija código

npm run lint



# Formate código com Prettier

npm run format

```



---



## 📚 Documentação da API



A API está totalmente documentada usando **Swagger/OpenAPI**. Acesse a documentação interativa:



**Desenvolvimento Local:**

`http://localhost:3001/api`



**Produção:**

Verifique sua URL do Render implantada + `/api`



### Principais Grupos de Endpoints



| Endpoint | Descrição |

|----------|-----------|

| `/auth` | Autenticação e registro de usuários |

| `/user` | Gerenciamento de perfil e funções de usuário |

| `/cards` | Operações CRUD de cartões de crédito |

| `/transactions` | Registro de compras com suporte a parcelamento |

| `/invoice` | Consultas de faturas e recálculo em massa |

| `/categories` | Gerenciamento de categorias de despesas |

| `/dependents` | Gerenciamento de usuários dependentes |



### Exemplos de Chamadas da API



#### Criar uma Transação com Parcelas



```bash

POST /transactions

Content-Type: application/json



{

  "cardId": "abc123",

  "purchaseName": "Notebook",

  "purchaseCategory": "Eletrônicos",

  "amount": 3000.00,

  "purchaseDate": "2025-01-15",

  "installments": 3,

  "installmentsValue": [1000.00, 1000.00, 1000.00],

  "dependentId": "def456"

}

```



#### Consultar Faturas dos Próximos 3 Meses



```bash

GET /invoice?month=2&year=2025

GET /invoice?month=3&year=2025

GET /invoice?month=4&year=2025

```



#### Filtrar Transações por Múltiplos Critérios



```bash

GET /transactions?cardId=abc123&purchaseCategory=Alimentação&startDate=2025-01&endDate=2025-03

```



---



## 🌍 Deploy



O projeto está configurado para deploy no **[Render](https://render.com/)**.



### Deploy Automático



1. Conecte seu repositório GitHub ao Render

2. Configure as variáveis de ambiente no painel do Render

3. Faça push para a branch `main`

4. O Render automaticamente constrói e implanta



### Hook Pós-Deploy



O script `postdeploy` executa automaticamente após o deployment:



```json

"postdeploy": "prisma db push"

```



### Deploy Manual



```bash

# Construa o projeto

npm run build



# Execute em modo de produção

npm run start:prod

```



### Variáveis de Ambiente (Render)



Certifique-se de que estas estão configuradas no seu painel do Render:

- `DATABASE_URL`

- `DIRECT_URL`

- `SUPABASE_URL`

- `SUPABASE_ANON_KEY`

- `SUPABASE_SERVICE_ROLE_KEY`

- `FRONTEND_URL`

- `NODE_ENV=production`



---



## 🔧 Configuração do Projeto



### Configuração TypeScript



- **Decoradores**: Habilitados para NestJS

- **Modo Strict**: Parcial (permite flexibilidade)

- **Módulo**: ES2022

- **Target**: ES2022



### Configuração ESLint



- **Parser**: `@typescript-eslint/parser`

- **Config**: `recommendedTypeChecked`

- **Largura de Linha**: 110 caracteres

- **Aspas**: Aspas simples preferidas



### Configuração Prettier



```json

{

  "singleQuote": true,

  "trailingComma": "all",

  "printWidth": 110

}

```



---



## 📖 Casos de Uso



### 1. Gerenciamento de Despesas Familiares

- Pais criam cartões de crédito

- Registram filhos como dependentes

- Rastreiam quem fez cada compra

- Analisam padrões de gastos por membro da família



### 2. Otimização Multi-cartão

- Gerencie múltiplos cartões de crédito

- Rastreie limites disponíveis em todos os cartões

- Preveja faturas futuras para planejar pagamentos

- Evite gastos excessivos monitorando limites



### 3. Previsão Financeira

- Visualize faturas projetadas para os próximos 6 meses

- Planeje grandes compras com parcelamento

- Analise tendências de gastos por categoria

- Defina orçamentos baseados em dados históricos



### 4. Gerenciamento de Parcelamento

- Crie compras com planos de parcelamento personalizados

- Calcule automaticamente em qual fatura cada parcela cai

- Rastreie progresso de pagamento ao longo de múltiplos meses

- Gerencie parcelamentos em múltiplos cartões



---



## 🤝 Contribuindo



Contribuições são bem-vindas! Este é um projeto de portfólio, mas sugestões e melhorias são apreciadas.



1. Faça um fork do repositório

2. Crie uma branch de feature (`git checkout -b feature/RecursoIncrivel`)

3. Commit suas mudanças (`git commit -m 'Adiciona algum RecursoIncrivel'`)

4. Push para a branch (`git push origin feature/RecursoIncrivel`)

5. Abra um Pull Request



---



## 📝 Licença



Este projeto está licenciado sob a licença **UNLICENSED** - é um projeto de portfólio privado.



---



## 👨‍💻 Autor



**Felippe Fernandes**



- GitHub: [@felippe-fernandes](https://github.com/felippe-fernandes)

- Repositório Frontend: [credit_card_planner_frontend](https://github.com/felippe-fernandes/credit_card_planner_frontend)



---



## 🙏 Agradecimentos



- Time **NestJS** pelo framework incrível

- Time **Prisma** pelo excelente ORM

- **Supabase** pelo PostgreSQL gerenciado e Auth

- **Render** pelo deploy fácil
