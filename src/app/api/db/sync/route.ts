import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import CopyModel from '../../../../models/Copy';
import UserModel from '../../../../models/User';
import { Copy } from '../../../../types/copy';
import { User } from '../../../../types/user';
import mongoose from 'mongoose';

// Interfaces para tipar los documentos de MongoDB
interface MongoDBCopy {
  _id: mongoose.Types.ObjectId;
  slug?: string;
  text?: string;
  language?: string;
  status?: string;
  tags?: string[];
  history?: any[];
  [key: string]: any;
}

// Tipo para los resultados de lean()
type LeanDocument = {
  _id: any;
  [key: string]: any;
}

/**
 * API para sincronizar datos entre el cliente y MongoDB
 * Permite operaciones CRUD básicas para copys y usuarios
 */

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Obtener datos de MongoDB
    const copys = await CopyModel.find().lean();
    const users = await UserModel.find().lean();
    
    console.log(`🔄 [DB Sync] Procesando ${copys.length} copys desde MongoDB...`);
    
    // Transformar _id a id para compatibilidad con el cliente
    const transformedCopys = copys.map((copy: any) => {
      // Extraer _id y resto de propiedades
      const { _id, ...rest } = copy;
      
      // Crear nuevo objeto con todas las propiedades necesarias
      return {
        ...rest,
        // Garantizar que siempre tengamos un id como string
        id: _id ? _id.toString() : '',
        // Garantizar que tags siempre sea un array
        tags: Array.isArray(copy.tags) ? copy.tags : [],
        // Garantizar que history siempre sea un array
        history: Array.isArray(copy.history) ? copy.history : [],
      };
    });
    
    // Solo log para copys con tags
    const copysWithTags = transformedCopys.filter(copy => copy.tags && copy.tags.length > 0);
    console.log(`✅ [DB Sync] ${copysWithTags.length} copys tienen tags:`, 
               copysWithTags.map(c => `${c.slug}: ${JSON.stringify(c.tags)}`).join(', '));
    
    const transformedUsers = users.map((user: any) => {
      // Extraer _id y resto de propiedades
      const { _id, ...rest } = user;
      return {
        ...rest,
        // Garantizar que siempre tengamos un id como string
        id: _id ? _id.toString() : '',
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        copys: transformedCopys, 
        users: transformedUsers 
      } 
    });
  } catch (error) {
    console.error('Error al obtener datos de MongoDB:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener datos de MongoDB' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, entity, data } = await req.json();
    
    await connectDB();
    
    // Validar parámetros
    if (!action || !entity || !data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parámetros incompletos' 
      }, { status: 400 });
    }
    
    // Seleccionar el modelo según la entidad
    const Model = entity === 'copy' ? CopyModel : UserModel;
    
    // Realizar la operación según la acción
    switch (action) {
      case 'create':
        // Asegurar que el ID del cliente se use como _id en MongoDB
        const newDoc = new Model({
          _id: data.id,
          ...data
        });
        await newDoc.save();
        return NextResponse.json({ success: true, data: newDoc });
        
      case 'update':
        if (!data.id) {
          return NextResponse.json({ 
            success: false, 
            error: 'ID no proporcionado para actualización' 
          }, { status: 400 });
        }
        
        // Eliminar id para no sobrescribir _id en MongoDB
        const { id, ...updateData } = data;
        
        const updatedDoc = await Model.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true }
        );
        
        if (!updatedDoc) {
          return NextResponse.json({ 
            success: false, 
            error: `${entity} no encontrado` 
          }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: updatedDoc });
        
      case 'delete':
        if (!data.id) {
          return NextResponse.json({ 
            success: false, 
            error: 'ID no proporcionado para eliminación' 
          }, { status: 400 });
        }
        
        const deletedDoc = await Model.findByIdAndDelete(data.id);
        
        if (!deletedDoc) {
          return NextResponse.json({ 
            success: false, 
            error: `${entity} no encontrado` 
          }, { status: 404 });
        }
        
        return NextResponse.json({ success: true });
        
      case 'sync':
        // Sincronización completa (eliminar todos y reemplazar)
        if (Array.isArray(data)) {
          await Model.deleteMany({});
          
          // Transformar los datos para MongoDB
          const docsToSave = data.map(item => ({
            _id: item.id,
            ...item
          }));
          
          await Model.insertMany(docsToSave);
          return NextResponse.json({ 
            success: true, 
            message: `${docsToSave.length} ${entity}s sincronizados` 
          });
        }
        
        return NextResponse.json({ 
          success: false, 
          error: 'Datos inválidos para sincronización' 
        }, { status: 400 });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Acción no soportada' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error en operación de ${req.method}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error en la operación de base de datos' 
    }, { status: 500 });
  }
}
