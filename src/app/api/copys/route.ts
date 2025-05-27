import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Copy from '../../../models/Copy';
import { CopyStatus } from '../../../types/copy';

/**
 * API Route para gestión de copys
 * GET: Obtener copys con filtros opcionales
 * POST: Crear un nuevo copy
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const status = searchParams.get('status');
    const slug = searchParams.get('slug');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    
    let query: any = {};
    
    // Filtros
    if (language) query.language = language;
    if (status) query.status = status;
    if (slug) query.slug = slug;
    if (assignedTo) query.assignedTo = assignedTo;
    
    // Búsqueda de texto
    if (search) {
      query.$or = [
        { slug: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Paginación
    const skip = (page - 1) * limit;
    
    const [copys, totalCount] = await Promise.all([
      Copy.find(query)
        .populate('assignedTo', 'username email')
        .populate('reviewedBy', 'username email')
        .populate('approvedBy', 'username email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Copy.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    console.log(`📊 API: Obtenidos ${copys.length} copys de ${totalCount} total (página ${page}/${totalPages})`);
    
    return NextResponse.json({
      success: true,
      data: copys,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo copys:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { slug, text, language, status, tags, isBulkImport } = body;
    
    // Validaciones básicas
    if (!text || !language) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos requeridos: text, language' 
        },
        { status: 400 }
      );
    }
    
    // Verificar unicidad de slug+idioma si se proporciona slug
    if (slug) {
      const existingCopy = await Copy.findOne({ slug, language });
      if (existingCopy) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Ya existe un copy con el slug "${slug}" para el idioma "${language}"` 
          },
          { status: 409 }
        );
      }
    }
    
    // Crear nuevo copy
    const newCopy = new Copy({
      slug: slug || '',
      text,
      language,
      status: status || 'not_assigned',
      tags: tags || [],
      isBulkImport: isBulkImport || false
    });
    
    const savedCopy = await newCopy.save();
    
    console.log(`✅ API: Copy creado - ${savedCopy.slug || 'sin slug'} (${savedCopy.language})`);
    
    return NextResponse.json({
      success: true,
      data: savedCopy,
      message: 'Copy creado exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creando copy:', error);
    
    // Manejar errores de validación de Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error de validación',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    // Manejar errores de duplicado
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un copy con este slug e idioma'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
