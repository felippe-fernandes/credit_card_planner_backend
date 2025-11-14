# 📚 Swagger API Documentation - Credit Card Planner

## 🎯 Acesso ao Swagger
Uma vez que o servidor esteja rodando, acesse a documentação interativa em:
```
http://localhost:3001/api
```

---

## 📋 Módulos Documentados

### 🔐 **Authentication**
Todos os endpoints (exceto login/signup) requerem autenticação via Bearer Token (cookie `sb_auth_token`).

---

## 🧾 **Invoice Module** - Gerenciamento de Faturas

### **GET /invoice**
Buscar todas as faturas do usuário autenticado com filtros opcionais.

**Query Parameters:**
- `cardId` (opcional) - Filtrar por ID do cartão
- `month` (opcional) - Filtrar por mês (1-12)
- `year` (opcional) - Filtrar por ano
- `status` (opcional) - Filtrar por status: `PENDING`, `PAID`, `OVERDUE`

**Exemplos de uso:**
```bash
# Todas as faturas
GET /invoice

# Faturas de um cartão específico
GET /invoice?cardId=cm8vsfvyx0001wce8b40bhum2

# Faturas de fevereiro de 2025
GET /invoice?month=2&year=2025

# Faturas pendentes
GET /invoice?status=PENDING

# Faturas pendentes de um cartão em um mês específico
GET /invoice?cardId=cm8vsfvyx0001wce8b40bhum2&month=2&year=2025&status=PENDING
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Invoices retrieved successfully",
  "count": 3,
  "result": [
    {
      "id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "cardId": "cm8vsfvyx0001wce8b40bhum2",
      "userId": "d5147b61-90d2-4b19-a987-c32e5e47e220",
      "month": 2,
      "year": 2025,
      "totalAmount": "2500.75",
      "paidAmount": "500.00",
      "dueDate": "2025-03-25T00:00:00.000Z",
      "status": "PENDING",
      "card": { "name": "Nubank" }
    }
  ]
}
```

---

### **GET /invoice/search**
Buscar uma fatura específica por ID ou por combinação de cartão + mês + ano.

**Query Parameters:**
- `id` (opcional) - ID da fatura
- `cardId` (opcional) - ID do cartão (requer month e year)
- `month` (opcional) - Mês (1-12, requer cardId e year)
- `year` (opcional) - Ano (requer cardId e month)

**Exemplos de uso:**
```bash
# Buscar por ID
GET /invoice/search?id=a1b2c3d4-5678-90ab-cdef-1234567890ab

# Buscar fatura de um cartão em um mês específico
GET /invoice/search?cardId=cm8vsfvyx0001wce8b40bhum2&month=2&year=2025
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Invoice retrieved successfully",
  "result": {
    "id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "cardId": "cm8vsfvyx0001wce8b40bhum2",
    "month": 2,
    "year": 2025,
    "totalAmount": "2500.75",
    "paidAmount": "500.00",
    "status": "PENDING"
  }
}
```

---

### **GET /invoice/forecast** 🔮
Prever faturas para os próximos X meses.

**Query Parameters:**
- `months` (obrigatório) - Número de meses para prever (ex: 1, 3, 6, 12)
- `cardId` (opcional) - Filtrar previsão por cartão específico

**Exemplos de uso:**
```bash
# Ver faturas dos próximos 3 meses (todos os cartões)
GET /invoice/forecast?months=3

# Ver faturas dos próximos 6 meses de um cartão específico
GET /invoice/forecast?months=6&cardId=cm8vsfvyx0001wce8b40bhum2
```

**Use Case Real:**
- "Quanto vou gastar nos próximos 3 meses?"
- "Quais as faturas futuras do meu cartão principal?"
- "Preciso me planejar para os próximos 6 meses"

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Invoices forecasted for the next 3 month(s)",
  "count": 5,
  "result": [...]
}
```

---

### **PUT /invoice/:id**
Atualizar informações de pagamento de uma fatura.

**Path Parameters:**
- `id` (obrigatório) - ID da fatura

**Body:**
```json
{
  "paidAmount": "1500.00",
  "status": "PENDING"
}
```

**Lógica Automática:**
- Se `paidAmount >= totalAmount`, o status é automaticamente alterado para `PAID`
- Se `paidAmount > 0` mas menor que `totalAmount`, status fica `PENDING`

**Exemplos de uso:**
```bash
# Registrar pagamento parcial
PUT /invoice/a1b2c3d4-5678-90ab-cdef-1234567890ab
{
  "paidAmount": "1000.00"
}

# Atualizar apenas o status
PUT /invoice/a1b2c3d4-5678-90ab-cdef-1234567890ab
{
  "status": "OVERDUE"
}
```

---

### **PATCH /invoice/:id/mark-paid**
Marcar fatura como paga rapidamente.

**Path Parameters:**
- `id` (obrigatório) - ID da fatura

**Body (opcional):**
```json
{
  "paidAmount": "2500.75"
}
```

**Comportamento:**
- Se `paidAmount` não for informado, usa o `totalAmount` da fatura
- Status automaticamente vira `PAID`

**Exemplos de uso:**
```bash
# Marcar como paga com valor total
PATCH /invoice/a1b2c3d4-5678-90ab-cdef-1234567890ab/mark-paid
{}

# Marcar como paga com valor específico
PATCH /invoice/a1b2c3d4-5678-90ab-cdef-1234567890ab/mark-paid
{
  "paidAmount": "2500.75"
}
```

---

### **POST /invoice/update**
Recalcular todas as faturas baseado nas transações.

**Use Case:**
- Executar após criar/editar/deletar transações em massa
- Sincronizar faturas com as transações atuais

---

## 💳 **Transactions Module** - Gerenciamento de Compras

### **GET /transactions**
Buscar todas as transações do usuário autenticado com filtros avançados.

**Query Parameters:**
- `card` (opcional) - Filtrar por ID do cartão
- `dependent` (opcional) - Filtrar por ID do dependente
- `purchaseName` (opcional) - Buscar por nome da compra (busca parcial)
- `purchaseCategory` (opcional) - Filtrar por categoria
- `purchaseDate` (opcional) - Filtrar por data específica de compra
- `startDate` (opcional) - Data inicial do intervalo **✨ NOVO**
- `endDate` (opcional) - Data final do intervalo **✨ NOVO**
- `installments` (opcional) - Filtrar por número de parcelas
- `installmentDates` (opcional) - Filtrar por datas das parcelas (formato: MM/YYYY)

**Exemplos de uso:**
```bash
# Todas as transações
GET /transactions

# Transações de um cartão específico
GET /transactions?card=cm8vsfvyx0001wce8b40bhum2

# Buscar por nome (partial match)
GET /transactions?purchaseName=Netflix

# Transações de uma categoria
GET /transactions?purchaseCategory=Entertainment

# Transações com 6 parcelas
GET /transactions?installments=6

# ✨ NOVO: Intervalo de datas (Janeiro a Março 2025)
GET /transactions?startDate=2025-01-01T00:00:00.000Z&endDate=2025-03-31T23:59:59.999Z

# ✨ NOVO: Combinar múltiplos filtros
GET /transactions?startDate=2025-01-01&endDate=2025-12-31&purchaseCategory=Food&card=cm8vsf

# Transações com parcelas em meses específicos
GET /transactions?installmentDates=02/2025,03/2025

# Transações de um dependente em um período
GET /transactions?dependent=abc123&startDate=2025-01-01&endDate=2025-06-30
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Transactions retrieved successfully",
  "count": 10,
  "result": [
    {
      "id": "cm8vz6s4s0001wcm0tlmxqabc",
      "cardId": "cm8vsfvyx0001wce8b40bhum2",
      "userId": "d5147b61-90d2-4b19-a987-c32e5e47e220",
      "dependentId": "d5147b61-90d2-4b19-a987-c32e5e47e223",
      "purchaseName": "Concert Tickets",
      "purchaseCategory": "Entertainment",
      "description": "Live music event",
      "amount": "200.00",
      "purchaseDate": "2025-03-22T20:15:00.000Z",
      "installments": 2,
      "installmentsValue": ["100.00", "100.00"],
      "installmentDates": ["04/2025", "05/2025"],
      "card": { "name": "Nubank" },
      "dependent": { "name": "Maria" }
    }
  ]
}
```

---

### **GET /transactions/search**
Buscar uma transação específica por múltiplos critérios.

**Query Parameters:**
- `id` - ID da transação
- `purchaseName` - Nome da compra
- `dependentId` - ID do dependente
- `cardId` - ID do cartão
- `purchaseCategory` - Categoria
- `description` - Descrição
- `purchaseDate` - Data da compra

---

### **POST /transactions**
Criar nova transação (compra).

**Body:**
```json
{
  "cardId": "cm8vsfvyx0001wce8b40bhum2",
  "purchaseName": "iPhone 16",
  "purchaseCategory": "Shopping",
  "description": "New smartphone",
  "amount": "10000.00",
  "installments": 10,
  "installmentValues": [3000, 700, 700, 700, 700, 700, 700, 700, 700, 700],
  "purchaseDate": "2025-03-30T16:36:06.092Z",
  "dependentId": "d5147b61-90d2-4b19-a987-c32e5e47e223"
}
```

**Comportamento:**
- Calcula automaticamente as datas das parcelas baseado no `payDay` do cartão
- Atualiza automaticamente o `availableLimit` do cartão
- Valida que a soma das parcelas = valor total

---

### **PUT /transactions/:id**
Atualizar uma transação existente.

---

### **DELETE /transactions/:id**
Deletar uma transação.

**Comportamento:**
- Recalcula automaticamente o `availableLimit` do cartão
- Remove a transação e seus dados de parcelamento

---

## 💳 **Cards Module** - Gerenciamento de Cartões

### **GET /cards**
Buscar todos os cartões do usuário com filtros.

**Query Parameters:**
- `flag` - Bandeira (Visa, Mastercard, etc)
- `bank` - Banco
- `dueDay` - Dia de vencimento
- `payDay` - Dia de fechamento
- `name` - Nome do cartão

---

### **POST /cards**
Criar novo cartão.

**Body:**
```json
{
  "name": "Nubank",
  "bank": "Nu Pagamentos",
  "flag": "Mastercard",
  "limit": "5000.00",
  "dueDay": 5,
  "payDay": 10
}
```

---

### **GET /cards/search**
Buscar cartão específico por ID, nome ou banco.

---

### **PATCH /cards/:id**
Atualizar cartão.

---

### **DELETE /cards/:id**
Deletar cartão.

---

## 👥 **Dependents Module** - Gerenciamento de Dependentes

### **GET /dependents**
Listar todos os dependentes.

### **POST /dependents**
Criar novo dependente.

### **GET /dependents/search**
Buscar dependente específico.

### **PATCH /dependents/:id**
Atualizar dependente.

### **DELETE /dependents/:id**
Deletar dependente.

---

## 🏷️ **Categories Module** - Gerenciamento de Categorias

### **GET /categories**
Listar todas as categorias.

**Categorias Padrão:**
- 🍔 Food
- 🚗 Transport
- 🎬 Entertainment
- 🏥 Health
- 📚 Education

### **POST /categories**
Criar categoria personalizada.

**Body:**
```json
{
  "name": "Pets",
  "icon": "🐶",
  "color": "#FF5733"
}
```

### **GET /categories/search**
Buscar categoria específica.

### **PATCH /categories/:id**
Atualizar categoria.

### **DELETE /categories/:id**
Deletar categoria.

---

## 🔐 **Auth Module** - Autenticação

### **POST /auth/signup**
Criar nova conta de usuário.

### **POST /auth/login**
Fazer login.

### **POST /auth/logout**
Fazer logout.

---

## 👤 **User Module** - Gerenciamento de Usuários

### **GET /users/me**
Obter dados do usuário autenticado.

### **PATCH /users/me**
Atualizar dados do usuário autenticado.

### **DELETE /users/me**
Deletar própria conta.

### **GET /users** (SUPER_ADMIN)
Listar todos os usuários.

### **PUT /users/change-role** (SUPER_ADMIN)
Alterar role de um usuário.

### **DELETE /users/delete/:id** (SUPER_ADMIN)
Deletar usuário específico.

---

## 🎨 **Padrões de Resposta**

Todas as respostas seguem o formato padrão:

### **Sucesso:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "result": { ... },
  "count": 10
}
```

### **Erro:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

---

## 🚀 **Novos Recursos Implementados**

### ✨ **Invoice Module - COMPLETO**
1. ✅ Filtragem por cardId, month, year, status
2. ✅ Busca de fatura específica
3. ✅ **Previsão de faturas futuras** (forecast)
4. ✅ Atualização de pagamentos
5. ✅ Marcar como paga rapidamente
6. ✅ Recálculo automático de faturas

### ✨ **Transactions Module - APRIMORADO**
1. ✅ **Filtro por intervalo de datas** (startDate, endDate)
2. ✅ Todas as descrições do Swagger melhoradas
3. ✅ Documentação mais clara dos filtros

### ✨ **Auth & Security**
1. ✅ Guards unificados (cookie-based em todos os módulos)
2. ✅ Autenticação consistente

### ✨ **Cards Module - CORRIGIDO**
1. ✅ Validação de nome de cartão por usuário (não mais global)

---

## 📖 **Como Usar o Swagger UI**

1. **Inicie o servidor:**
   ```bash
   npm run start:dev
   ```

2. **Acesse o Swagger:**
   ```
   http://localhost:3001/api
   ```

3. **Autentique-se:**
   - Faça login em `/auth/login`
   - Copie o token do cookie `sb_auth_token`
   - Clique em "Authorize" no topo da página
   - Cole o token
   - Agora pode testar todos os endpoints!

4. **Teste os endpoints:**
   - Clique em um endpoint para expandir
   - Clique em "Try it out"
   - Preencha os parâmetros
   - Clique em "Execute"
   - Veja a resposta em tempo real!

---

## 🎯 **Casos de Uso Práticos**

### 1. **Planejamento Financeiro**
```bash
# Ver quanto vou gastar nos próximos 6 meses
GET /invoice/forecast?months=6

# Ver faturas pendentes
GET /invoice?status=PENDING
```

### 2. **Análise de Gastos**
```bash
# Ver todas as compras de alimentação em 2025
GET /transactions?purchaseCategory=Food&startDate=2025-01-01&endDate=2025-12-31

# Ver gastos de um dependente específico
GET /transactions?dependent=abc123&startDate=2025-01-01&endDate=2025-06-30
```

### 3. **Gestão de Faturas**
```bash
# Registrar pagamento parcial
PUT /invoice/invoice-id
{ "paidAmount": "1500.00" }

# Marcar fatura como paga
PATCH /invoice/invoice-id/mark-paid
```

---

## 📝 **Notas Importantes**

1. **Autenticação:** Todos os endpoints (exceto login/signup) requerem autenticação
2. **Formato de Datas:** ISO 8601 (2025-01-01T00:00:00.000Z)
3. **Valores Monetários:** String com 2 casas decimais ("1500.00")
4. **installmentDates:** Formato MM/YYYY (ex: "02/2025")
5. **Status das Faturas:** PENDING, PAID, OVERDUE

---

**Documentação gerada em:** 2025-01-23
**Versão da API:** 1.0
**Padrão Swagger:** OpenAPI 3.0
