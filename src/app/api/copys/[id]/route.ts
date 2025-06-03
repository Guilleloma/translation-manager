import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Copy from '../../../../models/Copy';
import { generateUniqueId } from '../../../../utils/generateId';

/**
 * API Route para gestión de copys individuales
 * GET: Obtener un copy específico por ID
 * PATCH: Actualizar un copy específico
 * DELETE: Eliminar un copy específico
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Await params en Next.js 15+
    const { id } = await params;
    
    const copy = await Copy.findById(id)
      .populate('assignedTo', 'username email')
      .populate('reviewedBy', 'username email')
      .populate('approvedBy', 'username email');
    
    if (!copy) {
      return NextResponse.json(
        { success: false, error: 'Copy no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      copy
    });
  } catch (error) {
    console.error('Error fetching copy:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 ===== API PATCH /api/copys/[id] - INICIO =====');
  
  try {
    await connectDB();
    console.log('✅ Conexión a MongoDB establecida');
    
    // Await params en Next.js 15+
    const { id } = await params;
    console.log('🔍 ID recibido:', id);
    
    const body = await request.json();
    const { slug, text, language, status, assignedTo, reviewedBy, approvedBy, updateAllLanguages, metadata, tags } = body;
    
    // Añadir logs para ver si llegan los tags
    console.log('🏷️ Tags recibidos en la API:', tags);
    
    // Crear log para debugging
    console.log(`🔧 PATCH /api/copys/${id}:`, { 
      slug, 
      updateAllLanguages, 
      metadata,
      tags: tags ? `[${tags.length} etiquetas]` : 'ninguna', 
      bodyKeys: Object.keys(body) 
    });
    
    // El id puede ser un ObjectId de MongoDB o un slug
    let existingCopy;
    let isSearchingBySlug = false;
    
    try {
      // Intentar buscar por ID primero
      existingCopy = await Copy.findById(id);
      console.log(`💾 Búsqueda por ID: ${existingCopy ? 'Encontrado' : 'No encontrado'}`);
      if (existingCopy) {
        console.log('📋 COPY ENCONTRADO POR ID:', {
          id: existingCopy._id,
          slug: existingCopy.slug,
          language: existingCopy.language,
          needsSlugReview: existingCopy.needsSlugReview,
          translationGroupId: existingCopy.translationGroupId,
          isOriginalText: existingCopy.isOriginalText
        });
      }
    } catch (error) {
      // Si falla, buscar por slug
      console.log(`🔧 No es un ID válido, buscando por slug: ${id}`);
      existingCopy = await Copy.findOne({ slug: id });
      isSearchingBySlug = true;
      console.log(`💾 Búsqueda por slug '${id}': ${existingCopy ? 'Encontrado' : 'No encontrado'}`);
      
      if (existingCopy) {
        console.log('📋 COPY ENCONTRADO POR SLUG:', {
          id: existingCopy._id,
          slug: existingCopy.slug,
          language: existingCopy.language,
          needsSlugReview: existingCopy.needsSlugReview,
          translationGroupId: existingCopy.translationGroupId,
          isOriginalText: existingCopy.isOriginalText
        });
      }
      
      // Si no se encuentra por slug exacto, intentar buscar copys relacionados
      if (!existingCopy && updateAllLanguages) {
        console.log(`🔎 Slug '${id}' no encontrado. Intentando buscar copys relacionados...`);
        
        // Buscar todos los copys que tienen el slug en el formato original
        // O que tengan alguna relación (comparten el mismo texto)
        const relatedCopies = await Copy.find({
          $or: [
            { slug: { $regex: new RegExp(id, 'i') } },
            { slug: { $regex: new RegExp(slug, 'i') } }
          ]
        }).limit(5);
        
        if (relatedCopies.length > 0) {
          console.log(`🔍 Encontrados ${relatedCopies.length} copys relacionados:`, 
            relatedCopies.map(c => ({ slug: c.slug, language: c.language })));
          
          // Usar el primer copy relacionado
          existingCopy = relatedCopies[0];
          isSearchingBySlug = true;
          console.log(`🔧 Usando el primer copy relacionado: ${existingCopy.slug} (${existingCopy.language})`);
        }
      }
    }
    
    if (!existingCopy) {
      console.error(`❌ Copy no encontrado con ID/slug: ${id}`);
      return NextResponse.json(
        { success: false, error: `Copy no encontrado con ID/slug: ${id}` },
        { status: 404 }
      );
    }

    console.log('📊 ESTADO ANTES DE ACTUALIZACIÓN:', {
      copyId: existingCopy._id,
      currentSlug: existingCopy.slug,
      newSlug: slug,
      needsSlugReview: existingCopy.needsSlugReview,
      translationGroupId: existingCopy.translationGroupId,
      updateAllLanguages
    });

    // Si se está actualizando el slug
    if (slug && slug !== existingCopy.slug) {
      console.log('🔄 ACTUALIZANDO SLUG...');
      console.log(`🔧 Cambio de slug: "${existingCopy.slug}" → "${slug}"`);
      
      // El slug debe ser único globalmente, independientemente del grupo de traducción
      // Verificar que el nuevo slug no exista ya (excepto para el mismo grupo)
      const translationGroupId = existingCopy.translationGroupId;
      
      console.log(`🔐 Verificando disponibilidad del slug: ${slug}`);
      console.log(`🔑 Grupo de traducción actual: ${translationGroupId || 'ninguno'}`);
      
      const duplicateCheck = await Copy.findOne({
        slug: slug,
        // Si pertenece a un grupo, excluir ese grupo completo
        ...((translationGroupId) ? 
          { translationGroupId: { $ne: translationGroupId } } : 
          { _id: { $ne: existingCopy._id } })
      });
      
      if (duplicateCheck) {
        console.error(`❌ Error: El slug "${slug}" ya está en uso por otro grupo de traducción`);
        return NextResponse.json(
          { success: false, error: `Ya existe un copy con ese slug en otro grupo de traducción` },
          { status: 400 }
        );
      }
      
      console.log(`✅ Slug "${slug}" disponible para uso`);
      
      // Si updateAllLanguages es true, actualizar todos los copys del mismo grupo de traducción
      if (updateAllLanguages) {
        console.log(`💾 ACTUALIZANDO GRUPO DE TRADUCCIÓN`);
        console.log(`🔧 Cambiando slug "${existingCopy.slug}" a "${slug}" en todos los idiomas`);
        
        // Crear objeto de actualización
        const updateData: any = { 
          slug: slug,
          updatedAt: new Date(),
          // Marcar que el slug ya no necesita revisión
          needsSlugReview: false
        };
        
        // Si hay metadatos, agregarlos a la actualización
        if (metadata) {
          console.log(`🔧 Agregando metadatos:`, metadata);
          updateData.metadata = metadata;
        }
        
        console.log(`🔧 Marcando slug como revisado por developer: ${existingCopy.slug} → ${slug}`);
        
        try {
          // ESTRATEGIA PRINCIPAL: Buscar por translationGroupId si existe
          const translationGroupId = existingCopy.translationGroupId;
          let copiesToUpdate = [];
          
          if (translationGroupId) {
            // Buscar todas las traducciones que pertenecen al mismo grupo
            copiesToUpdate = await Copy.find({ translationGroupId });
            console.log(`🔑 Encontrados ${copiesToUpdate.length} copys en el grupo: ${translationGroupId}`);
            console.log('📋 COPYS EN EL GRUPO:', copiesToUpdate.map(c => ({
              id: c._id,
              slug: c.slug,
              language: c.language,
              needsSlugReview: c.needsSlugReview
            })));
          } else {
            // Si no tiene grupo, crear uno nuevo y asignarlo a este copy
            const newGroupId = generateUniqueId();
            console.log(`🌟 Creando nuevo grupo de traducción: ${newGroupId}`);
            
            // Actualizar el copy actual con un groupId
            await Copy.findByIdAndUpdate(existingCopy._id, { 
              translationGroupId: newGroupId,
              isOriginalText: true
            });
            
            console.log('✅ Copy principal actualizado con nuevo grupo');
            
            // Añadir el groupId al objeto de actualización
            updateData.translationGroupId = newGroupId;
            
            // Buscar otras traducciones con el mismo slug o texto
            copiesToUpdate = await Copy.find({
              $or: [
                { slug: existingCopy.slug, _id: { $ne: existingCopy._id } },
                { text: existingCopy.text, language: { $ne: existingCopy.language } }
              ]
            });
            
            console.log(`🔍 Encontrados ${copiesToUpdate.length} copys relacionados por slug o texto`);
            console.log('📋 COPYS RELACIONADOS:', copiesToUpdate.map(c => ({
              id: c._id,
              slug: c.slug,
              language: c.language,
              text: c.text.substring(0, 20) + '...'
            })));
          }
          
          // Contador para el número de actualizaciones
          let updatedCount = 0;
          
          // Si encontramos copys relacionados, actualizarlos todos
          if (copiesToUpdate.length > 0) {
            console.log(`🔄 INICIANDO ACTUALIZACIÓN DE ${copiesToUpdate.length} COPYS...`);
            
            // Actualizar todos los copys uno por uno para mejor control y seguimiento
            for (const copy of copiesToUpdate) {
              console.log(`🔧 Actualizando: ${copy.slug} (${copy.language}) → ${slug}`);
              
              // Actualizar con el nuevo slug y el mismo groupId
              const updatedCopy = await Copy.findByIdAndUpdate(copy._id, { 
                $set: { 
                  ...updateData,
                  translationGroupId: translationGroupId || updateData.translationGroupId
                } 
              }, { new: true });
              
              console.log(`✅ Copy actualizado:`, {
                id: updatedCopy._id,
                oldSlug: copy.slug,
                newSlug: updatedCopy.slug,
                language: updatedCopy.language,
                groupId: updatedCopy.translationGroupId
              });
              
              updatedCount++;
            }
          }
          
          // Siempre actualizar el copy actual
          console.log(`🔧 Actualizando copy principal: ${existingCopy._id}`);
          const updatedMainCopy = await Copy.findByIdAndUpdate(
            existingCopy._id,
            { $set: updateData },
            { new: true }
          );
          
          console.log(`✅ Copy principal actualizado:`, {
            id: updatedMainCopy._id,
            slug: updatedMainCopy.slug,
            language: updatedMainCopy.language,
            needsSlugReview: updatedMainCopy.needsSlugReview,
            groupId: updatedMainCopy.translationGroupId
          });
          
          // Si no actualizó otros copys, incrementar el contador para el principal
          if (copiesToUpdate.length === 0) {
            updatedCount++;
          }
          
          // Obtener todos los copys actualizados para mostrar en la respuesta
          const finalCopies = await Copy.find({ slug });
          console.log(`📊 RESULTADO FINAL: ${finalCopies.length} copys con slug "${slug}"`);
          console.log('📋 COPYS FINALES:', finalCopies.map(c => ({
            id: c._id,
            slug: c.slug,
            language: c.language,
            needsSlugReview: c.needsSlugReview,
            groupId: c.translationGroupId
          })));
          
          // Enviar un evento especial para notificar a los clientes
          console.log(`📣 Emitiendo evento copysUpdated para notificar cambios de slugs`);
          
          console.log('🚀 ===== API PATCH - ACTUALIZACIÓN GRUPO EXITOSA =====');
          
          return NextResponse.json({
            success: true,
            message: `✅ Slug actualizado correctamente en ${updatedCount} traducciones. Ahora hay ${finalCopies.length} copys con este slug.`,
            updatedCopies: finalCopies,
            groupId: translationGroupId || updateData.translationGroupId
          });
        } catch (error) {
          console.error(`❌ Error al actualizar grupo de traducción:`, error);
          
          // Intentar actualizar solo el copy actual como último recurso
          const fallbackCopy = await Copy.findByIdAndUpdate(
            existingCopy._id,
            { $set: updateData },
            { new: true }
          );
          
          return NextResponse.json({
            success: true,
            message: `⚠️ Advertencia: Solo se actualizó el copy en ${existingCopy.language} debido a un error.`,
            error: error instanceof Error ? error.message : 'Error desconocido',
            updatedCopies: [fallbackCopy]
          });
        }
      }
    }
    
    // Si no se actualiza en todos los idiomas, solo actualizar el copy actual
    const updateData: any = {};
    if (text !== undefined) updateData.text = text;
    if (language !== undefined) updateData.language = language;
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (reviewedBy !== undefined) updateData.reviewedBy = reviewedBy;
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (slug !== undefined) updateData.slug = slug;
    // Añadir soporte para la actualización de tags
    if (tags !== undefined) {
      // Asegurar que tags sea un array
      updateData.tags = Array.isArray(tags) ? tags : [];
      console.log('🏷️ Actualizando tags en la base de datos:', updateData.tags);
    }
    
    updateData.updatedAt = new Date();
    
    // Usar el método correcto según cómo encontramos el copy
    const updatedCopy = isSearchingBySlug 
      ? await Copy.findOneAndUpdate(
          { slug: existingCopy.slug },
          updateData,
          { new: true, runValidators: true }
        ).populate('assignedTo', 'username email')
         .populate('reviewedBy', 'username email')
         .populate('approvedBy', 'username email')
      : await Copy.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).populate('assignedTo', 'username email')
         .populate('reviewedBy', 'username email')
         .populate('approvedBy', 'username email');
    
    return NextResponse.json({
      success: true,
      copy: updatedCopy,
      message: 'Copy actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error updating copy:', error);
    
    // Manejar errores de validación de MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: `Errores de validación: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Await params en Next.js 15+
    const { id } = await params;
    
    const deletedCopy = await Copy.findByIdAndDelete(id);
    
    if (!deletedCopy) {
      return NextResponse.json(
        { success: false, error: 'Copy no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Copy eliminado exitosamente',
      deletedCopy
    });
  } catch (error) {
    console.error('Error deleting copy:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
