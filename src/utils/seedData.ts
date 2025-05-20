import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../types/user';
import { Copy, CopyStatus } from '../types/copy';

/**
 * Datos semilla para pruebas y demos
 * Este archivo contiene datos de ejemplo para facilitar el desarrollo y las demostraciones
 * Los datos se cargan automáticamente cuando localStorage está vacío
 */

// Usuarios de ejemplo
export const seedUsers: User[] = [
  {
    id: 'admin-1',
    username: 'Admin Demo',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  },
  {
    id: 'translator-1',
    username: 'Traductor EN-FR',
    email: 'translator@example.com',
    role: UserRole.TRANSLATOR,
    languages: ['en', 'fr'],
  },
  {
    id: 'translator-2',
    username: 'María García',
    email: 'maria@example.com',
    role: UserRole.TRANSLATOR,
    languages: ['es', 'it'],
  },
  {
    id: 'translator-3',
    username: 'John Smith',
    email: 'john@example.com',
    role: UserRole.TRANSLATOR,
    languages: ['en', 'de'],
  },
];

// Copys de ejemplo para diferentes idiomas y casuísticas
export const seedCopys: Copy[] = [
  // ===== ESPAÑOL =====
  // Copys completos con slug
  {
    id: uuidv4(),
    slug: 'login.title',
    text: 'Iniciar sesión',
    language: 'es',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 días atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: uuidv4(),
    slug: 'login.email',
    text: 'Correo electrónico',
    language: 'es',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: uuidv4(),
    slug: 'login.password',
    text: 'Contraseña',
    language: 'es',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: uuidv4(),
    slug: 'login.submit',
    text: 'Entrar',
    language: 'es',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  // Copy sin slug en español
  {
    id: uuidv4(),
    slug: '',
    text: 'Texto pendiente de asociar a un slug',
    language: 'es',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  // Copy traducido y revisado
  {
    id: uuidv4(),
    slug: 'dashboard.welcome',
    text: 'Bienvenido al panel de control',
    language: 'es',
    status: 'revisado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    assignedTo: 'translator-2',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  // Copy aprobado
  {
    id: uuidv4(),
    slug: 'common.welcome',
    text: 'Bienvenido',
    language: 'es',
    status: 'aprobado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    assignedTo: 'translator-2',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
  },
  
  // ===== INGLÉS =====
  // Textos del login (algunos traducidos, otros pendientes, diferentes estados)
  {
    id: uuidv4(),
    slug: 'login.title',
    text: 'Log in',
    language: 'en',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    assignedTo: 'translator-1',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // Asignado hace 2 horas
  },
  {
    id: uuidv4(),
    slug: 'login.email',
    text: 'Email address',
    language: 'en',
    status: 'traducido',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    assignedTo: 'translator-1',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: uuidv4(),
    slug: 'login.password',
    text: 'Password',
    language: 'en',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
  },
  {
    id: uuidv4(),
    slug: 'login.submit',
    text: 'Submit',
    language: 'en',
    status: 'assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    assignedTo: 'translator-3',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // Asignado hace 3 horas
  },
  // Texto sin slug pendiente de asignar
  {
    id: uuidv4(),
    slug: '',
    text: 'Text waiting to be assigned to a slug',
    language: 'en',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  // Mismo texto que en español pero en inglés (para pruebas multiidioma)
  {
    id: uuidv4(),
    slug: 'dashboard.welcome',
    text: 'Welcome to the dashboard',
    language: 'en',
    status: 'aprobado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    assignedTo: 'translator-1',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
  
  // ===== ITALIANO =====
  // Botones comunes en diferentes estados
  {
    id: uuidv4(),
    slug: 'button.save',
    text: 'Salva',
    language: 'it',
    status: 'traducido',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    assignedTo: 'translator-2',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: uuidv4(),
    slug: 'button.cancel',
    text: 'Annulla',
    language: 'it',
    status: 'assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    assignedTo: 'translator-2',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // Asignado hace 1 hora
  },
  {
    id: uuidv4(),
    slug: 'button.edit',
    text: 'Modifica',
    language: 'it',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  // Slug sin texto asignado en italiano
  {
    id: uuidv4(),
    slug: 'nav.settings',
    text: '',
    language: 'it',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  
  // ===== FRANCÉS =====
  // Mensajes de error en diferentes estados
  {
    id: uuidv4(),
    slug: 'error.required',
    text: 'Ce champ est obligatoire',
    language: 'fr',
    status: 'traducido',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    assignedTo: 'translator-1',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    id: uuidv4(),
    slug: 'error.invalid_email',
    text: 'Adresse e-mail invalide',
    language: 'fr',
    status: 'assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    assignedTo: 'translator-1',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // Asignado hace 5 horas
  },
  // Copy asignado a un traductor y luego reasignado a otro
  {
    id: uuidv4(),
    slug: 'nav.account',
    text: 'Compte',
    language: 'fr',
    status: 'assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    assignedTo: 'translator-1', // Reasignado
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // Reasignado recientemente
  },
  
  // ===== ALEMÁN =====
  // Textos del perfil en diferentes estados
  {
    id: uuidv4(),
    slug: 'profile.title',
    text: 'Benutzerprofil',
    language: 'de',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    assignedTo: 'translator-3',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // Asignado hace 4 horas
  },
  {
    id: uuidv4(),
    slug: 'profile.save',
    text: 'Änderungen speichern',
    language: 'de',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  // Copy con slug que tiene puntos anidados para probar conflictos
  {
    id: uuidv4(),
    slug: 'button',
    text: 'Knopf',
    language: 'de',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  
  // ===== PORTUGUÉS =====
  // Algunos copys en portugués para probar múltiples idiomas
  {
    id: uuidv4(),
    slug: 'login.title',
    text: 'Iniciar sessão',
    language: 'pt',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    id: uuidv4(),
    slug: 'button.save',
    text: 'Salvar',
    language: 'pt',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
];

/**
 * Carga los datos semilla en localStorage si no existen
 * Esto permite tener datos de prueba consistentes para demostraciones
 */
export function loadSeedData(): void {
  console.log('🌱 Verificando datos semilla...');
  
  // Verificar si ya tienen los datos esperados (evita carga parcial)
  const storedUsers = localStorage.getItem('users');
  const storedCopys = localStorage.getItem('copys');
  
  // Verificación más robusta - comprobar que los datos contienen la estructura esperada
  let parsedUsers: any[] = [];
  let parsedCopys: any[] = [];
  let needsUserRefresh = true;
  let needsCopyRefresh = true;
  
  // Intentar analizar los datos almacenados
  try {
    if (storedUsers) {
      parsedUsers = JSON.parse(storedUsers);
      
      // Verificar si todos los usuarios esperados están presentes
      const adminExists = parsedUsers.some(u => u.role === 'admin');
      const translatorsCount = parsedUsers.filter(u => u.role === 'translator').length;
      
      needsUserRefresh = !adminExists || translatorsCount < 3;
      
      if (!needsUserRefresh) {
        console.log(`✅ ${parsedUsers.length} usuarios existentes validados`);
      }
    }
    
    if (storedCopys) {
      parsedCopys = JSON.parse(storedCopys);
      
      // Verificar si hay copys para todos los idiomas esperados
      const languages = new Set(parsedCopys.map((c: any) => c.language));
      needsCopyRefresh = parsedCopys.length < 10 || languages.size < 5; // Esperamos al menos 5 idiomas y 10 copys
      
      if (!needsCopyRefresh) {
        console.log(`✅ ${parsedCopys.length} copys existentes validados`);
      }
    }
  } catch (error) {
    console.error('Error al analizar datos almacenados:', error);
    needsUserRefresh = true;
    needsCopyRefresh = true;
  }
  
  // Cargar usuarios si es necesario
  if (needsUserRefresh) {
    console.log('🔄 Restaurando usuarios semilla...');
    localStorage.setItem('users', JSON.stringify(seedUsers));
    console.log(`✅ ${seedUsers.length} usuarios cargados`);
  }
  
  // Cargar copys si es necesario
  if (needsCopyRefresh) {
    console.log('🔄 Restaurando copys semilla...');
    localStorage.setItem('copys', JSON.stringify(seedCopys));
    console.log(`✅ ${seedCopys.length} copys cargados`);
  }
}

/**
 * Restaura los datos semilla, sobrescribiendo cualquier dato existente
 * Útil para resetear el estado de la aplicación para demos o pruebas
 */
export function resetToSeedData(): void {
  console.log('🔄 Restaurando datos semilla...');
  
  // Guardar usuario actual antes de resetear
  const currentUser = localStorage.getItem('user');
  
  // Resetear datos
  localStorage.setItem('users', JSON.stringify(seedUsers));
  localStorage.setItem('copys', JSON.stringify(seedCopys));
  
  // Restaurar usuario actual si existe
  if (currentUser) {
    localStorage.setItem('user', currentUser);
  }
  
  console.log('✅ Datos restaurados a su estado inicial');
}
