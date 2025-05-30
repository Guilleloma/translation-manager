import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Copy from '../../../../models/Copy';

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
  try {
    await connectDB();
    
    // Await params en Next.js 15+
    const { id } = await params;
    
    const body = await request.json();
    const { slug, text, language, status, assignedTo, reviewedBy, approvedBy, updateAllLanguages, metadata } = body;
    
    // Crear log para debugging
    console.log(`🔧 PATCH /api/copys/${id}:`, { 
      slug, 
      updateAllLanguages, 
      metadata, 
      bodyKeys: Object.keys(body) 
    });
    
    // El id puede ser un ObjectId de MongoDB o un slug
    let existingCopy;
    let isSearchingBySlug = false;
    
    try {
      // Intentar buscar por ID primero
      existingCopy = await Copy.findById(id);
    } catch (error) {
      // Si falla, buscar por slug
      console.log(`🔧 No es un ID válido, buscando por slug: ${id}`);
      existingCopy = await Copy.findOne({ slug: id });
      isSearchingBySlug = true;
    }
    
    if (!existingCopy) {
      return NextResponse.json(
        { success: false, error: 'Copy no encontrado' },
        { status: 404 }
      );
    }

    // Si se está actualizando el slug
    if (slug && slug !== existingCopy.slug) {
      // Verificar que el nuevo slug no exista ya para ningún idioma
      const duplicateCheck = await Copy.findOne({
        slug: slug,
        // Solo excluir por ID si estamos buscando por ID, no por slug
        ...(isSearchingBySlug ? {} : { _id: { $ne: id } })
      });
      
      if (duplicateCheck) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un copy con ese slug' },
          { status: 400 }
        );
      }
      
      // Si updateAllLanguages es true, actualizar todos los copys con el mismo slug
      if (updateAllLanguages) {
        console.log(`🔧 Actualizando slug "${existingCopy.slug}" a "${slug}" en todos los idiomas`);
        
        // Crear objeto de actualización con los metadatos si están presentes
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
        
        console.log(`🔧 Marcando slug como revisado: ${existingCopy.slug} → ${slug}`);
        
        // Actualizar todos los copys con el mismo slug en todos los idiomas
        await Copy.updateMany(
          { slug: existingCopy.slug },
          { $set: updateData }
        );
        
        // Obtener todos los copys actualizados para devolverlos en la respuesta
        const updatedCopies = await Copy.find({ slug });
        
        return NextResponse.json({
          success: true,
          message: `Slug actualizado en ${updatedCopies.length} idiomas`,
          updatedCopies
        });
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
