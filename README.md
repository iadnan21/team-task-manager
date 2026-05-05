# Team Task Manager

A full-stack web application for project and task management with role-based access control (Admin/Member).

## Features

- **Authentication** — Signup/Login with JWT
- **Project Management** — Create, update, delete projects with team collaboration
- **Task Management** — Create, assign, track tasks with status (TODO/IN_PROGRESS/DONE) and priority (LOW/MEDIUM/HIGH)
- **Role-Based Access Control** — Admin and Member roles with granular permissions
- **Dashboard** — Overview of all tasks, stats, and overdue task alerts
- **Team Management** — Add/remove members to projects (Admin only)

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: JWT + bcrypt
- **Deployment**: Railway

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/projects | JWT | List user's projects |
| POST | /api/projects | JWT | Create project |
| GET | /api/projects/:id | JWT | Project details with tasks |
| PUT | /api/projects/:id | JWT | Update project (Admin) |
| DELETE | /api/projects/:id | JWT | Delete project (Admin) |
| POST | /api/projects/:id/members | JWT | Add team member (Admin) |
| DELETE | /api/projects/:id/members/:uid | JWT | Remove member (Admin) |
| GET | /api/tasks | JWT | List tasks |
| POST | /api/tasks | JWT | Create task |
| PUT | /api/tasks/:id | JWT | Update task |
| DELETE | /api/tasks/:id | JWT | Delete task (Admin) |
| GET | /api/dashboard | JWT | Dashboard stats |

## Database Schema

- **User** — id, name, email, password, role (ADMIN/MEMBER)
- **Project** — id, name, description, createdById
- **ProjectMember** — projectId, userId, role (ADMIN/MEMBER)
- **Task** — id, title, description, status, priority, dueDate, projectId, assigneeId, createdById

## Local Setup

```bash
# Clone the repo
git clone https://github.com/iadnan21/team-task-manager.git
cd team-task-manager

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your PostgreSQL connection string

# Run database migrations
cd server && npx prisma db push

# Start development servers
cd server && npm run dev    # Backend on :5000
cd client && npm run dev    # Frontend on :3000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret key for JWT token signing |
| PORT | Server port (default: 5000) |

## Deployment

Deployed on Railway with PostgreSQL addon.

**Live URL**: [Coming soon]

## Demo

- Sign up as **Admin** to create projects and manage teams
- Sign up as **Member** to view assigned projects and manage tasks
- Admin can add/remove members, create/delete projects and tasks
- All users can create tasks, update task status, and view the dashboard
