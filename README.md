# 💳 Expense Tracker

This project is an API built with NestJS for tracking credit card expenses.  
It uses PostgreSQL hosted on Supabase as the database and is deployed on Render.

---

## 🚀 Technologies Used

- **NestJS**: A progressive Node.js framework
- **Prisma**: ORM to interact with PostgreSQL
- **Supabase**: Managed PostgreSQL database
- **Render**: Deployment platform

---

## 🏗 Project Structure

- **Backend**: Built with NestJS and Prisma
- **Database**: PostgreSQL on Supabase
- **Authentication**: Supabase Auth
- **Deployment**: Deployed on Render

---

## 🔧 Environment Setup

### 1. Clone the repository:

```bash
git clone https://github.com/your-username/your-repository.git
cd your-repository
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Then open `.env` and fill in the required values:

```env
DATABASE_URL=postgresql://your-user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
```

### 4. Run database migrations:

```bash
npx prisma db push
```

### 5. Start the local server:

```bash
npm run start:dev
```

## 🌍 Deployment on Render

The project is set up for automatic deployment on [Render](https://render.com).  
After each push to the `main` branch, Render automatically builds and restarts the server.

If you need to run it manually:

```bash
npm run build && npm run start:prod
```

Developed by Felippe Fernandes 🚀
