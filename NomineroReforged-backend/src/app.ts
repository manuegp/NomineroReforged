import express from 'express';
import { Database } from 'sqlite3';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { userRoutes } from './routes/user.routes';
import { errorHandler } from './utils/errorHandler';
import { DepartmentController } from './controllers/department.controller';
import { DepartmentService } from './services/department.service';
import { departmentRoutes } from './routes/department.routes';
import { clientRoutes } from './routes/clients.routes';
import { ClientController } from './controllers/client.controller';
import { ClientService } from './services/client.service';
import { PhaseService } from './services/phase.service';
import { PhaseController } from './controllers/phase.controller';
import { phaseRoutes } from './routes/phase.routes';
import { TypeService } from './services/type.service';
import { TypeController } from './controllers/types.controller';
import { typeRoutes } from './routes/types.routes';
import { ProjectService } from './services/project.service';
import { ProjectController } from './controllers/project.controller';
import { projectRoutes } from './routes/project.routes';
import { RegisterService } from './services/register.service';
import { RegisterController } from './controllers/register.controller';
import { registerRoutes } from './routes/registers.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize SQLite database
const db = new Database(process.env.DB_PATH || ':memory:', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1); // Exit the process with a failure code
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(express.json());

// Initialize services and controllers
const userService = new UserService(db);
const departmentService = new DepartmentService(db);
const clientService = new ClientService(db);
const phaseService = new PhaseService(db);
const typeService = new TypeService(db);
const projectService = new ProjectService(db);
const registertService = new RegisterService(db);

const userController = new UserController(userService);
const phaseController = new PhaseController(phaseService);
const departmentController = new DepartmentController(departmentService);
const clientController = new ClientController(clientService);
const typeController = new TypeController(typeService);
const projectController = new ProjectController(projectService);
const registerController = new RegisterController(registertService);


// Routes
app.use('/api/users', userRoutes(userController));
app.use('/api/departments', departmentRoutes(departmentController, departmentService)); 
app.use('/api/clients', clientRoutes(clientController)); 
app.use('/api/phases', phaseRoutes(phaseController)); 
app.use('/api/types', typeRoutes(typeController)); 
app.use('/api/proyects', projectRoutes(projectController)); 
app.use('/api/registers', registerRoutes(registerController)); 
// Error handling middleware
app.use(errorHandler);

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err.message);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });
  });
});

export default app;