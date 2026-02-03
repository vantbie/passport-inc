import express, {Application, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config(); // carga las variables de entorno

// instanciamos la aplicacion
const app: Application = express();

// Middleware
app.use(express.json());

// ruta de prueba 
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', message: 'PassPort Inc. API is running'});
});

//levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[SERVER]: Ejecutandose en http://localhost:${PORT}`);
});