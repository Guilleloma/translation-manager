import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import CopyModel from '../../../../models/Copy';

/**
 * API endpoint para eliminar todos los copys de la base de datos
 * Solo accesible para administradores
 * 
 * @route DELETE /api/db/reset-copies
 */
export async function DELETE() {
  console.log('[API] DELETE /api/db/reset-copies - Eliminando todos los copys');
  
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Eliminar todos los documentos de la colección Copy
    const result = await CopyModel.deleteMany({});
    
    console.log(`[API] Eliminados ${result.deletedCount} copys de la base de datos`);
    
    // Devolver respuesta exitosa
    return NextResponse.json({ 
      success: true, 
      message: `Se han eliminado ${result.deletedCount} copys de la base de datos`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('[API] Error al eliminar copys:', error);
    
    // Devolver error
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al eliminar los copys', 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
