# InternSync

InternSync is a modern, enterprise-grade Intern & Employee Management System built with a stunning Liquid Glassmorphism UI. It provides a comprehensive platform for managing interns, employees, projects, and departments with full role-based access control and department-scoped management.

## 🚀 Features

### Core Platform
- **Liquid UI/UX**: State-of-the-art, fully responsive frontend featuring animated gradients, floating elements, and deep glassmorphism effects.
- **Authentication & Authorization**: Secure JWT-based authentication with Role-Based Access Control (RBAC) supporting four distinct user roles.
- **Department-Based Routing**: Interns are automatically assigned to departments based on their specialization.
- **Analytics Dashboard**: Real-time visualization of intern and project metrics with interactive charts.
- **PDF Export**: Export filtered intern directory reports and weekly working reports to styled PDF documents.

### Role-Based Access

| Role | Access Level |
|------|-------------|
| **ADMIN** | Full system access — manage all interns, employees, projects, departments, and analytics |
| **GENERAL MANAGER** | Department-scoped admin — manage interns, employees, and projects within their department |
| **DEPUTY GENERAL MANAGER** | Same as GM — department-scoped management with full visibility |
| **EMPLOYEE** | Personal dashboard — view assigned projects, manage tasks, working schedule, and profile |
| **INTERN** | Personal portal — view profile, assigned projects, and daily log book |

### Department Structure

The system supports three departments with specialization-based routing:

| Department | Specializations |
|------------|----------------|
| **Digital Platforms** | AI, BA, C#, CICD, Cloud, Flutter, FullStack, JAVA, MERN, PHP, PM, Python, QA, ReactJS, UIUX |
| **Digital Labs** | IOT |
| **Human Capital** | Finance, Marketing, Logistics |

### Admin Panel
- **Dashboard**: System-wide analytics with intern counts, project stats, and university distribution charts.
- **Directory**: Filterable intern directory with PDF export capability.
- **Intern Management**: Full CRUD for intern profiles with login account creation.
- **Employee Management**: Add, edit, and delete employees with designation and specialization assignment.
- **Project Management**: Create projects with supervisor assignment, intern/employee allocation, and status tracking.
- **Department Management**: Create and manage departments with linked employees and interns.

### GM / Deputy GM Panel
- **Department Dashboard**: Department-scoped analytics showing intern counts, pending reviews, and active projects.
- **Department Interns**: Tabbed view (Pending Review / Assigned / All) with stipend management (Paid/Non-Paid) and project assignment modal.
- **Department Projects**: View, create, edit, and delete projects within their department. Assign supervisors and interns.
- **Department Employees**: Full employee management within their department — add, edit, and delete employees with auto-locked department field.

### Employee Features
- **Employee Dashboard**: Personal overview with assigned projects and tasks.
- **My Projects**: View all projects the employee is assigned to.
- **Task Checklist**: Personal task management with completion tracking.
- **Working Schedule**: Weekly working days selector with calendar-aware week tracking and PDF export of weekly reports.
- **My Profile**: View and update personal profile information.

### Intern Features
- **Intern Dashboard**: Personal overview with assignment status and project info.
- **My Profile**: View personal intern profile.
- **My Projects**: View all assigned projects with details.
- **Daily Log Book**: Record daily internship activities.

## 🛠 Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS
- Recharts (Data Visualization)
- jsPDF & jsPDF-AutoTable (PDF Generation)
- React Router DOM v6
- Axios

**Backend:**
- Java 21
- Spring Boot 3.2.5
- Spring Security & JJWT (JWT Authentication)
- Spring Data MongoDB
- Maven

**Database:**
- MongoDB Atlas (Cloud)

## ⚙️ Prerequisites

- **Java 21** or higher
- **Maven 3.9** or higher
- **Node.js** (latest LTS)
- **MongoDB** (Atlas Cloud or local instance)

## 🏃‍♂️ How to Run Locally

### 1. Backend (Spring Boot)

The backend requires a valid MongoDB connection string to start.

Open a PowerShell terminal, navigate to the `backend` directory, and set the `MONGODB_URI` environment variable before running:

```powershell
cd backend
$env:MONGODB_URI="<YOUR_MONGODB_CONNECTION_STRING>"
mvn clean package
mvn spring-boot:run
```

The backend API will start on `http://localhost:19090`.

> **Note on Default Admin Account:**
> On first startup, if no admin user exists, the backend will automatically create a default ADMIN account:
> - **Username**: admin
> - **Password**: Admin@12345
> - **Email**: admin@internsync.local

### 2. Frontend (React / Vite)

Open a new terminal and navigate to the `frontend` directory:

```powershell
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:15173`. You can log in using the default admin credentials.

## 🔐 Key API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/login` | Authenticate user and get JWT | Public |
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/register-employee` | Register employee with user account | Admin/GM |
| `POST` | `/api/auth/create-intern-user` | Create login account for intern | Admin |
| `POST` | `/api/auth/forgot-password` | Generate password reset token | Public |
| `POST` | `/api/auth/reset-password` | Reset password using token | Public |
| `GET` | `/api/auth/me` | Get current logged-in user profile | Authenticated |
| `PUT` | `/api/auth/profile` | Update own profile | Authenticated |

### Interns
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/interns` | List all interns | Admin |
| `POST` | `/api/interns` | Create intern profile | Admin |
| `GET` | `/api/interns/{id}` | Get specific intern | Admin, Employee |
| `PUT` | `/api/interns/{id}` | Update intern profile | Admin |
| `DELETE` | `/api/interns/{id}` | Delete intern | Admin |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/projects` | List all projects | Admin |
| `POST` | `/api/projects` | Create project | Admin, Employee |
| `PUT` | `/api/projects/{id}` | Update project | Admin, Employee |
| `DELETE` | `/api/projects/{id}` | Delete project | Admin, Employee |
| `POST` | `/api/projects/{id}/assign-interns` | Assign interns to project | Admin, Employee |
| `DELETE` | `/api/projects/{id}/remove-intern/{internId}` | Remove intern from project | Admin, Employee |
| `GET` | `/api/projects/my-projects` | Get own assigned projects | Intern |

### Employees
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/employees` | List all employees | Admin |
| `POST` | `/api/employees` | Create employee | Admin, GM/DGM |
| `GET` | `/api/employees/{id}` | Get specific employee | Admin, Employee |
| `PUT` | `/api/employees/{id}` | Update employee | Admin, GM/DGM |
| `DELETE` | `/api/employees/{id}` | Delete employee | Admin, GM/DGM |

### Departments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/departments` | List all departments | Public |
| `POST` | `/api/departments` | Create department | Admin, Employee |
| `GET` | `/api/departments/{id}` | Get department details | Admin, Employee |
| `PUT` | `/api/departments/{id}` | Update department | Admin, Employee |
| `DELETE` | `/api/departments/{id}` | Delete department | Admin, Employee |

### GM / Deputy GM Specific
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/gm/dashboard` | Department dashboard stats | GM |
| `GET` | `/api/gm/department-interns` | List department interns | GM |
| `GET` | `/api/gm/department-projects` | List department projects | GM |
| `GET` | `/api/gm/department-employees` | List department employees | GM |
| `GET` | `/api/gm/pending-interns` | List pending interns | GM |
| `PUT` | `/api/gm/interns/{id}/stipend-type` | Update intern stipend status | GM |
| `POST` | `/api/gm/projects/{id}/assign-interns` | Assign intern to project | GM |
| `DELETE` | `/api/gm/projects/{id}/remove-intern/{id}` | Remove intern from project | GM |
| `GET` | `/api/dgm/dashboard` | Department dashboard stats | DGM |
| `GET` | `/api/dgm/department-interns` | List department interns | DGM |
| `GET` | `/api/dgm/department-employees` | List department employees | DGM |

### Employee Features
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/employee-tasks/my-tasks` | Get personal task list | Employee |
| `POST` | `/api/employee-tasks` | Create new task | Employee |
| `GET` | `/api/employee-schedules/my-schedule` | Get working schedule | Employee |
| `POST` | `/api/employee-schedules` | Save working schedule | Employee |
| `GET` | `/api/employees/me/projects` | Get own assigned projects | Employee |

## 📦 Cloud Production Deployment (Render + Vercel)

InternSync is configured to be deployed using Render for the backend and Vercel for the frontend.

### 1. Backend Deployment (Render)

Create a new Web Service on Render with the following settings:
- **Environment**: Docker
- **Root Directory**: `backend`
- **Dockerfile Path**: `Dockerfile`
- **Health Check Path**: `/api/status`

**Environment Variables**:
- `MONGODB_URI`: `mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority`
- `JWT_SECRET`: `<long-random-secret-at-least-32-characters>`
- `JWT_EXPIRATION_MS`: `86400000`
- `APP_VERSION`: `1.0.0`
- `ALLOWED_ORIGINS`: `http://localhost:15173,https://your-vercel-app.vercel.app`
- `SECURITY_LOG_LEVEL`: `INFO`

### 2. Frontend Deployment (Vercel)

Create a new Project on Vercel with the following settings:

Vercel settings:
- **Framework Preset**: Vite
- **Root Directory**: frontend
- **Install Command**: npm install
- **Build Command**: npm run build
- **Output Directory**: dist

Vercel environment variable:
- `VITE_API_BASE_URL=https://internsync-backend-phar.onrender.com/api`

After Vercel deployment:
- Copy the Vercel frontend URL.
- Add it to Render backend environment variable `ALLOWED_ORIGINS`.
- Example: `ALLOWED_ORIGINS=http://localhost:15173,https://your-vercel-app.vercel.app`
- Redeploy the Render backend.

### Final Deployment Checklist

- [ ] MongoDB Atlas network access allows Render backend
- [ ] Render backend deployed successfully
- [ ] `/api/status` works from browser
- [ ] Vercel frontend deployed successfully
- [ ] Vercel URL added to Render `ALLOWED_ORIGINS`
- [ ] Render backend redeployed after adding Vercel URL
- [ ] Vercel frontend loads.
- [ ] Login page loads.
- [ ] Admin login works.
- [ ] Intern login works.
- [ ] Employee login works.
- [ ] General Manager login works.
- [ ] Deputy General Manager login works.
- [ ] Dashboard pages load.
- [ ] Refreshing `/gm-dashboard` does not show 404.
- [ ] Refreshing `/projects` does not show 404.
- [ ] Browser DevTools Network tab shows API requests going to: `https://internsync-backend-phar.onrender.com/api`
- [ ] No API requests should go to: `localhost:19090`

## 📂 Project Structure

```
internsync-management-system/
├── backend/
│   └── src/main/java/com/example/deploymentlab/
│       ├── config/          # Security, CORS, JWT configuration
│       ├── controller/      # REST API controllers
│       ├── model/           # MongoDB document models
│       ├── repository/      # Spring Data MongoDB repositories
│       └── service/         # Business logic services
├── frontend/
│   └── src/
│       ├── components/      # Shared UI components (Navbar, ProtectedRoute)
│       ├── context/         # React Context (AuthContext)
│       ├── pages/
│       │   ├── auth/        # Login, Register, Password Reset
│       │   ├── departments/ # Department CRUD pages
│       │   ├── dgm/         # Deputy GM dashboard
│       │   ├── employees/   # Employee management & dashboard
│       │   ├── gm/          # GM dashboard, interns, projects, employees
│       │   ├── interns/     # Intern management & portal
│       │   └── projects/    # Project management
│       ├── api.js           # Axios API configuration
│       ├── App.jsx          # Main routing
│       └── index.css        # Global styles & Tailwind config
└── README.md
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
