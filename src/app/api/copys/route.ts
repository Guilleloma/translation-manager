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
    const needsSlugReview = searchParams.get('needsSlugReview');
    
    let query: any = {};
    
    // Filtros
    if (language) query.language = language;
    if (status) query.status = status;
    if (slug) query.slug = slug;
    if (assignedTo) query.assignedTo = assignedTo;
    
    // Filtrar por slugs que necesitan revisión
    if (needsSlugReview === 'true') {
      query.needsSlugReview = true;
      console.log('🔧 Filtrando copys que necesitan revisión de slug');
    } else if (needsSlugReview === 'false') {
      query.needsSlugReview = false;
    }
    
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
  console.log('🚀 ===== API POST /api/copys - INICIO =====');
  
  try {
    await connectDB();
    console.log('✅ Conexión a MongoDB establecida');

    const body = await request.json();
    console.log('📥 DATOS RECIBIDOS EN API:', {
      text: body.text?.substring(0, 50) + '...',
      slug: body.slug,
      language: body.language,
      needsSlugReview: body.needsSlugReview,
      translationGroupId: body.translationGroupId,
      isOriginalText: body.isOriginalText,
      allKeys: Object.keys(body)
    });

    // Validar que los campos requeridos estén presentes
    if (!body.text || !body.slug || !body.language) {
      console.error('❌ Faltan campos requeridos:', {
        hasText: !!body.text,
        hasSlug: !!body.slug,
        hasLanguage: !!body.language
      });
      return NextResponse.json(
        { success: false, error: 'Los campos text, slug y language son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que no exista un copy con el mismo slug
    console.log('🔍 Verificando duplicados de slug...');
    const existingCopy = await Copy.findOne({ slug: body.slug });
    
    if (existingCopy) {
      console.log('⚠️ SLUG DUPLICADO ENCONTRADO:', {
        existingId: existingCopy._id,
        existingSlug: existingCopy.slug,
        existingLanguage: existingCopy.language,
        existingGroupId: existingCopy.translationGroupId,
        newLanguage: body.language,
        newGroupId: body.translationGroupId
      });
      
      // Si pertenecen al mismo grupo de traducción, permitir el duplicado
      if (existingCopy.translationGroupId && body.translationGroupId && 
          existingCopy.translationGroupId === body.translationGroupId) {
        console.log('✅ Mismo grupo de traducción, permitiendo slug duplicado');
      } else {
        console.error('❌ Slug duplicado en diferente grupo o sin grupo');
        return NextResponse.json(
          { success: false, error: `Ya existe un copy con el slug "${body.slug}"` },
          { status: 400 }
        );
      }
    } else {
      console.log('✅ Slug disponible para uso');
    }

    // Crear el nuevo copy
    console.log('💾 CREANDO COPY EN BASE DE DATOS...');
    const newCopy = new Copy({
      text: body.text,
      slug: body.slug,
      language: body.language,
      status: body.status || 'not_assigned',
      createdAt: new Date(),
      updatedAt: new Date(),
      history: body.history || [],
      needsSlugReview: body.needsSlugReview !== undefined ? body.needsSlugReview : true,
      translationGroupId: body.translationGroupId,
      isOriginalText: body.isOriginalText !== undefined ? body.isOriginalText : true
    });

    console.log('💾 COPY A GUARDAR:', {
      slug: newCopy.slug,
      language: newCopy.language,
      needsSlugReview: newCopy.needsSlugReview,
      translationGroupId: newCopy.translationGroupId,
      isOriginalText: newCopy.isOriginalText,
      text: newCopy.text.substring(0, 30) + '...'
    });

    const savedCopy = await newCopy.save();
    console.log('✅ COPY GUARDADO EN BD:', {
      id: savedCopy._id,
      slug: savedCopy.slug,
      language: savedCopy.language,
      needsSlugReview: savedCopy.needsSlugReview,
      translationGroupId: savedCopy.translationGroupId,
      isOriginalText: savedCopy.isOriginalText
    });

    console.log('🚀 ===== API POST /api/copys - FIN EXITOSO =====');
    return NextResponse.json({
      success: true,
      copy: savedCopy,
      message: 'Copy creado exitosamente'
    });
  } catch (error: any) {
    console.error('❌ ===== API POST /api/copys - ERROR =====');
    console.error('Error creating copy:', error);
    
    // Manejar errores de validación de MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      console.error('❌ Errores de validación:', validationErrors);
      return NextResponse.json(
        { success: false, error: `Errores de validación: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Manejar errores de duplicado de MongoDB
    if (error.code === 11000) {
      console.error('❌ Error de duplicado MongoDB:', error.keyValue);
      return NextResponse.json(
        { success: false, error: 'Ya existe un copy con esos datos únicos' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
