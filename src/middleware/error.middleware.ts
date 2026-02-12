import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

// Express sabe que este es un middleware de ERROR ÚNICAMENTE porque tiene 4 argumentos (err, req, res, next).

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    // Valores por defecto si el error no trae nada (para bugs inesperados)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Entorno de DESARROLLO (Queremos ver TODO el detalle para arreglarlo)
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack // Nos dice la línea exacta del archivo donde explotó
        });
    } 
    // Entorno de PRODUCCIÓN (El usuario final no debe ver detalles técnicos feos)
    else {
        // A. Error Operacional (Creado por nosotros con AppError): Es seguro mostrar el mensaje.
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } 
        // B. Error de Programación o Librería (Bug desconocido): No le mostramos detalles al usuario.
        else {
            // Logueamos el error en la consola del servidor para que tú lo veas
            console.error('ERROR', err);

            // Al usuario le mandamos un mensaje genérico
            res.status(500).json({
                status: 'error',
                message: 'Algo salió mal, por favor intente más tarde.'
            });
        }
    }
};