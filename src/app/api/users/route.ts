import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { UserRole } from '../../../types/user';

/**
 * API Route para gestión de usuarios
 * GET: Obtener todos los usuarios o filtrar por parámetros
 * POST: Crear un nuevo usuario
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const language = searchParams.get('language');
    
    let query: any = {};
    
    // Filtrar por rol si se especifica
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query.role = role;
    }
    
    // Filtrar por idioma si se especifica
    if (language) {
      query.languages = language;
    }
    
    const users = await User.find(query).sort({ createdAt: -1 });
    
    console.log(`📊 API: Obtenidos ${users.length} usuarios${role ? ` con rol ${role}` : ''}${language ? ` que hablan ${language}` : ''}`);
    
    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
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
    const { username, email, password, role, languages } = body;
    
    // Validaciones básicas
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos requeridos: username, email, password, role' 
        },
        { status: 400 }
      );
    }
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un usuario con este email' 
        },
        { status: 409 }
      );
    }
    
    // Crear nuevo usuario
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password,
      role,
      languages: languages || []
    });
    
    const savedUser = await newUser.save();
    
    console.log(`✅ API: Usuario creado - ${savedUser.username} (${savedUser.role})`);
    
    return NextResponse.json({
      success: true,
      data: savedUser,
      message: 'Usuario creado exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    
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
