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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Obtener parámetros de filtro
    const language = searchParams.get('language');
    const languages = searchParams.getAll('language'); // Obtener todos los parámetros language
    const status = searchParams.get('status');
    const slug = searchParams.get('slug');
    const assignedTo = searchParams.get('assignedTo');
    const needsSlugReview = searchParams.get('needsSlugReview');
    const search = searchParams.get('search');
    
    let query: any = {};
    
    // Filtros
    if (languages.length > 0) {
      // Si hay múltiples idiomas, usar $in operator
      query.language = { $in: languages };
      console.log(`🌐 [API] Filtrando por múltiples idiomas: ${languages.join(', ')}`);
    } else if (language) {
      // Si hay un solo idioma, usar igualdad directa
      query.language = language;
      console.log(`🌐 [API] Filtrando por idioma único: ${language}`);
    }
    
    if (status) query.status = status;
    if (slug) query.slug = slug;
    if (assignedTo) query.assignedTo = assignedTo;
    
    // 🔍 LOG DE DEPURACIÓN: Ver qué se está consultando
    if (assignedTo) {
      console.log(`🔍 [API] Consultando copys asignados a: ${assignedTo}`);
      console.log(`🔍 [API] Query completa:`, JSON.stringify(query, null, 2));
    }
    
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
    
    // 🔍 LOG DE DEPURACIÓN: Ver resultados detallados
    if (assignedTo) {
      console.log(`🔍 [API] Copys encontrados: ${copys.length}`);
      copys.forEach((copy, index) => {
        console.log(`  Copy ${index + 1}:`, {
          id: copy._id,
          slug: copy.slug,
          language: copy.language,
          status: copy.status,
          assignedTo: copy.assignedTo ? (copy.assignedTo as any)._id || copy.assignedTo : null,
          assignedToUsername: copy.assignedTo ? (copy.assignedTo as any).username : null
        });
      });
    }
    
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

    // Verificar que no exista un copy con el mismo slug e idioma
    console.log('🔍 Verificando duplicados de slug e idioma...');
    const existingCopy = await Copy.findOne({ 
      slug: body.slug,
      language: body.language 
    });
    
    if (existingCopy) {
      console.log('⚠️ COPY DUPLICADO ENCONTRADO:', {
        existingId: existingCopy._id,
        existingSlug: existingCopy.slug,
        existingLanguage: existingCopy.language,
        existingGroupId: existingCopy.translationGroupId,
        newLanguage: body.language,
        newGroupId: body.translationGroupId
      });
      
      // Si pertenecen al mismo grupo de traducción, actualizar el existente
      if (existingCopy.translationGroupId && body.translationGroupId && 
          existingCopy.translationGroupId === body.translationGroupId) {
        console.log('✅ Mismo grupo de traducción, actualizando copy existente');
        
        // Actualizar el copy existente con los nuevos datos
        const updatedCopy = await Copy.findByIdAndUpdate(
          existingCopy._id,
          { 
            $set: { 
              ...body,
              updatedAt: new Date() 
            } 
          },
          { new: true }
        );
        
        console.log('✅ COPY ACTUALIZADO:', {
          id: updatedCopy._id,
          slug: updatedCopy.slug,
          language: updatedCopy.language,
          status: updatedCopy.status
        });
        
        return NextResponse.json({
          success: true,
          copy: JSON.parse(JSON.stringify(updatedCopy)), // Asegurar serialización correcta
          message: 'Copy actualizado exitosamente',
          wasUpdated: true
        });
      } else {
        console.error('❌ Copy duplicado con mismo slug e idioma');
        return NextResponse.json(
          { 
            success: false, 
            error: `Ya existe un copy con el slug "${body.slug}" para el idioma "${body.language}"`,
            existingCopyId: existingCopy._id
          },
          { status: 400 }
        );
      }
    } else {
      console.log('✅ Slug e idioma disponibles para uso');
    }

    // Crear el nuevo copy
    console.log('💾 CREANDO COPY EN BASE DE DATOS...');
    const newCopy = new Copy({
      text: body.text,
      slug: body.slug,
      language: body.language,
      status: body.status || 'not_assigned',
      assignedTo: body.assignedTo, // Añadir campo assignedTo
      assignedAt: body.assignedAt, // Añadir campo assignedAt
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
      assignedTo: newCopy.assignedTo, // Log del campo assignedTo
      status: newCopy.status,
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
      assignedTo: savedCopy.assignedTo, // Log del campo assignedTo
      needsSlugReview: savedCopy.needsSlugReview,
      translationGroupId: savedCopy.translationGroupId,
      isOriginalText: savedCopy.isOriginalText
    });

    console.log('🚀 ===== API POST /api/copys - FIN EXITOSO =====');
    return NextResponse.json({
      success: true,
      copy: JSON.parse(JSON.stringify(savedCopy)), // Asegurar serialización correcta
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
