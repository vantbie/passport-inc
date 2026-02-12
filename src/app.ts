import express, {Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import { AppError } from './utils/AppError.js';
import { globalErrorHandler } from './middleware/error.middleware.js';

dotenv.config(); // carga las variables de entorno

// instanciamos la aplicacion
const app: Application = express();

// Middleware
app.use(express.json());

// Cookie
app.use(cookieParser());

// Direccion
app.use('/auth', authRoutes);

// ruta de prueba 
app.get('/health', async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();

        res.json({
            status: "OK",
            database: "SQLite conectada",
            usuariosRegistrados: totalUsers
        });

    }catch (error) {
        res.status(500).json({ status: "ERROR", message: "No se pudo conectar a la DB" });
    }
});

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