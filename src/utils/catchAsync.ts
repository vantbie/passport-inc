import { Request, Response, NextFunction } from 'express';

// Recibe una función ( ruta o controlador)
export const catchAsync = (fn: Function) => {
    // Devuelve una nueva función que Express va a ejecutar
    return (req: Request, res: Response, next: NextFunction) => {
        // Ejecuta el código y le pega un .catch() al final
        // Si el codigo falla, next() recibe el error y lo manda al GlobalErrorHandler
        fn(req, res, next).catch(next);
    };
};