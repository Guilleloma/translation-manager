import { NextRequest, NextResponse } from 'next/server';
import { 
  migrateAllSeedDataToMongoDB, 
  checkMigrationStatus, 
  clearAllMongoDBData 
} from '../../../services/seedMigration';

/**
 * API Route para gestión de migración de datos
 * GET: Verificar estado de la migración
 * POST: Ejecutar migración de datos seed a MongoDB
 * DELETE: Limpiar todos los datos de MongoDB
 */

export async function GET(request: NextRequest) {
  try {
    const status = await checkMigrationStatus();
    
    console.log(`📊 Estado de migración: ${status.usersCount} usuarios, ${status.copysCount} copys`);
    
    return NextResponse.json({
      success: true,
      data: status,
      message: status.isComplete ? 'Migración completada' : 'Migración pendiente'
    });
    
  } catch (error) {
    console.error('❌ Error verificando estado de migración:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error verificando estado de migración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'migrate') {
      console.log('🚀 Iniciando migración de datos seed a MongoDB...');
      
      await migrateAllSeedDataToMongoDB();
      
      const finalStatus = await checkMigrationStatus();
      
      return NextResponse.json({
        success: true,
        data: finalStatus,
        message: 'Migración completada exitosamente'
      });
      
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Acción no válida. Use "migrate"' 
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error ejecutando migración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 Limpiando todos los datos de MongoDB...');
    
    await clearAllMongoDBData();
    
    const status = await checkMigrationStatus();
    
    return NextResponse.json({
      success: true,
      data: status,
      message: 'Todos los datos han sido eliminados de MongoDB'
    });
    
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error limpiando datos de MongoDB',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
