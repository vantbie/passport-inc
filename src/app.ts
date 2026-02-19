import express, {Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
// @ts-ignore
import { xss } from 'express-xss-sanitizer';
import hpp from 'hpp';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cookieParser from 'cookie-parser';
import { AppError } from './utils/AppError.js';
import { globalErrorHandler } from './middleware/error.middleware.js';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'url'; // Importa 'fileURLToPath' desde 'url'
const __filename = fileURLToPath(import.meta.url); // // Crea las variables manualmente
const __dirname = path.dirname(__filename);

dotenv.config(); // carga las variables de entorno

// instanciamos la aplicacion
const app: Application = express();

// Busca los archivos de public
app.use(express.static(path.join(__dirname, '../public')));

// Configuracion de cors
app.use(cors());

// Establecer encabezados HTTP de seguridad
app.use(helmet());

// Limit requests
const limiter = rateLimit({
    max: 100, // Máximo 100 peticiones
    windowMs: 60 * 60 * 1000, // En 1 hora
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en una hora.'
});
app.use('/auth', limiter);

// Body parser con limite
app.use(express.json({limit: '10kb'}));

//Saneamiento de datos contra XSS
app.use(xss());

// Prevenir la contaminación de parámetros
app.use(hpp());

// Middleware
app.use(express.json());

// Cookie
app.use(cookieParser());

// Direccion
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Manejo de rutas no encontradas
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`No se encontro la ruta ${req.originalUrl} en este servidor`, 404));
});

// Manejar errores globales
app.use(globalErrorHandler);


//levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[SERVER]: Ejecutandose en http://localhost:${PORT}`);
});