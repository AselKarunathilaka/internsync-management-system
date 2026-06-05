# InternSync

InternSync is a modern, enterprise-grade Intern Management System designed with a stunning Liquid Glassmorphism UI. It is built to seamlessly track and manage intern profiles, providing rich analytics and PDF export capabilities.

## 🚀 Features

- **Liquid UI/UX**: A state-of-the-art, fully responsive frontend featuring animated gradients, floating elements, and deep glassmorphism effects.
- **Authentication & Authorization**: Secure JWT-based authentication with Role-Based Access Control (RBAC). 
  - **ADMIN**: Can manage all interns, assign projects, and view analytics.
  - **INTERN**: Can view their own profile and assigned projects.
- **Project Management**: Create projects, set statuses, and assign multiple interns to a project.
- **Analytics Dashboard**: Real-time visualization of intern metrics, categorized by university and specialization.
- **Advanced Filtering**: Filter the directory by name, ID, or specific IT specializations.
- **PDF Export**: Instantly export custom-filtered intern directory reports to PDF.
- **Network Ready**: Built-in dynamic IP routing so the frontend automatically adapts to network deployments without hardcoded IPs.

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Recharts (Data Visualization)
- jsPDF & jsPDF-AutoTable (PDF Generation)
- React Router DOM
- Axios

**Backend:**
- Java 21
- Spring Boot 3.2.5
- Spring Security & JJWT
- Spring Data MongoDB
- Maven

**Database:**
- MongoDB Atlas (Cloud)

## ⚙️ Prerequisites

- **Java 21** or higher
- **Maven 3.9** or higher
- **Node.js** (latest LTS)

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

**Authentication:**
- `POST /api/auth/login` - Authenticate user and get JWT
- `POST /api/auth/forgot-password` - Generate password reset token
- `POST /api/auth/reset-password` - Reset password using token
- `GET /api/auth/me` - Get current logged-in user

**Interns (Secured):**
- `GET /api/interns` - List all interns (ADMIN only)
- `POST /api/interns` - Create intern (ADMIN only)
- `GET /api/interns/{id}` - Get specific intern (ADMIN or own profile)

**Projects (Secured):**
- `GET /api/projects` - List all projects (ADMIN only)
- `POST /api/projects` - Create project (ADMIN only)
- `POST /api/projects/{id}/assign-interns` - Assign interns to project (ADMIN only)
- `GET /api/projects/my-projects` - Get projects assigned to logged in intern (INTERN only)

## 📦 Production Deployment (Windows IIS)

InternSync is specifically configured to be deployed on a Windows Server using IIS.

1. **Backend**: Compile the Spring Boot backend using `mvn clean package` and run the resulting `.jar` file on your server. Ensure the `MONGODB_URI` environment variable is set on the Windows Server.
2. **Frontend**: Inside the `frontend` directory, run:
   ```powershell
   npm run build
   ```
3. **IIS Hosting**: This will generate an optimized `dist` folder. Copy the contents of this folder directly to your IIS site directory.
4. **Automatic Routing**: Because the frontend uses dynamic API routing, it will automatically route API requests to port `19090` of your Windows Server's IP address!
