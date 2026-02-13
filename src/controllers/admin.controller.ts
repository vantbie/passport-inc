import { Request, Response } from 'express';
import  prisma  from '../lib/prisma.js';

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Silenciamos a ts con "!"
  const userMakingRequest = req.user!; 

  // Evitar que el propio admin se elimine
  if (userMakingRequest.id === Number(id)) {
     return res.status(400).json({ 
         status: 'fail',
         message: 'No puedes eliminar tu propia cuenta.' 
     });
  }

  try {
    // Verificar si existe el usuario
    const user = await prisma.usuarios.findUnique({ where: { id: Number(id) } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Ejecutar la sentencia
    await prisma.usuarios.delete({ where: { id: Number(id) } });

    res.status(200).json({
      status: 'success',
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error });
  }
};