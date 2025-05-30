import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../types/user';
import { Copy, CopyStatus } from '../types/copy';

/**
 * Datos semilla para pruebas y demos
 * Este archivo contiene datos de ejemplo para facilitar el desarrollo y las demostraciones
 * Los datos se cargan automáticamente cuando localStorage está vacío
 */

// Usuarios de ejemplo con roles específicos
export const seedUsers: User[] = [
  // Administrador
  {
    id: 'admin-1',
    username: 'Admin Demo',
    email: 'admin@example.com',
    password: 'admin123', // Solo para desarrollo
    role: UserRole.ADMIN,
    languages: ['es', 'en', 'fr', 'de', 'it', 'pt'],
  },
  // Revisor
  {
    id: 'reviewer-1',
    username: 'Revisor Principal',
    email: 'reviewer@example.com',
    password: 'reviewer123', // Solo para desarrollo
    role: UserRole.REVIEWER,
    languages: ['es', 'en'],
  },
  // Desarrollador
  {
    id: 'dev-1',
    username: 'Desarrollador',
    email: 'dev@example.com',
    password: 'dev123', // Solo para desarrollo
    role: UserRole.DEVELOPER,
    languages: ['en'],
  },
  // Traductores
  {
    id: 'translator-1',
    username: 'Ana López (EN-FR)',
    email: 'ana@example.com',
    password: 'translator123', // Solo para desarrollo
    role: UserRole.TRANSLATOR,
    languages: ['en', 'fr'],
  },
  {
    id: 'translator-2',
    username: 'María García (ES-IT)',
    email: 'maria@example.com',
    password: 'translator123', // Solo para desarrollo
    role: UserRole.TRANSLATOR,
    languages: ['es', 'it'],
  },
  {
    id: 'translator-3',
    username: 'John Smith (EN-DE)',
    email: 'john@example.com',
    password: 'translator123', // Solo para desarrollo
    role: UserRole.TRANSLATOR,
    languages: ['en', 'de'],
  },
  {
    id: 'translator-4',
    username: 'Sophie Martin (FR-PT)',
    email: 'sophie@example.com',
    password: 'translator123', // Solo para desarrollo
    role: UserRole.TRANSLATOR,
    languages: ['fr', 'pt'],
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
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 días atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: uuidv4(),
    slug: 'login.email',
    text: 'Correo electrónico',
    language: 'es',
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: uuidv4(),
    slug: 'login.password',
    text: 'Contraseña',
    language: 'es',
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: uuidv4(),
    slug: 'login.submit',
    text: 'Entrar',
    language: 'es',
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  // Copy sin slug en español
  {
    id: uuidv4(),
    slug: '',
    text: 'Texto pendiente de asociar a un slug',
    language: 'es',
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  // Copy traducido y revisado con etiquetas, comentarios e historial
  {
    id: uuidv4(),
    slug: 'dashboard.welcome',
    text: 'Bienvenido al panel de control',
    language: 'es',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    assignedTo: 'translator-2',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    reviewedBy: 'reviewer-1',
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    tags: ['ui', 'dashboard'],
    comments: [
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'translator-2',
        userName: 'María García (ES-IT)',
        text: 'He traducido este texto adaptándolo al contexto del panel de control',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
      },
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'reviewer-1',
        userName: 'Revisor Principal',
        text: 'Traducción correcta, pero considera usar "Bienvenido/a" para ser más inclusivo',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
      }
    ],
    history: [
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'admin-1',
        userName: 'Admin Demo',
        previousStatus: 'not_assigned',
        newStatus: 'assigned',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
      },
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'translator-2',
        userName: 'María García (ES-IT)',
        previousStatus: 'assigned',
        newStatus: 'translated',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
      },
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'reviewer-1',
        userName: 'Revisor Principal',
        previousStatus: 'translated',
        newStatus: 'reviewed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        comments: 'Revisado y aprobado con sugerencias menores'
      }
    ]
  },
  // Copy aprobado con etiquetas e historial
  {
    id: uuidv4(),
    slug: 'common.welcome',
    text: 'Bienvenido',
    language: 'es',
    status: 'approved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    assignedTo: 'translator-2',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    reviewedBy: 'reviewer-1',
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    approvedBy: 'admin-1',
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    tags: ['common', 'ui'],
    comments: [
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'reviewer-1',
        userName: 'Revisor Principal',
        text: 'Traducción simple pero correcta',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
      },
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'admin-1',
        userName: 'Admin Demo',
        text: 'Aprobado para producción',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
      }
    ],
    history: [
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'admin-1',
        userName: 'Admin Demo',
        previousStatus: 'not_assigned',
        newStatus: 'assigned',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
      },
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'translator-2',
        userName: 'María García (ES-IT)',
        previousStatus: 'assigned',
        newStatus: 'translated',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8)
      },
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'reviewer-1',
        userName: 'Revisor Principal',
        previousStatus: 'translated',
        newStatus: 'reviewed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        comments: 'Revisado y listo para aprobación'
      },
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'admin-1',
        userName: 'Admin Demo',
        previousStatus: 'reviewed',
        newStatus: 'approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        comments: 'Aprobado para la versión de producción'
      }
    ]
  },
  
  // ===== INGLÉS =====
  // Textos del login (algunos traducidos, otros pendientes, diferentes estados)
  {
    id: uuidv4(),
    slug: 'login.title',
    text: 'Log in',
    language: 'en',
    status: 'assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    assignedTo: 'translator-1',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // Asignado hace 2 horas
    tags: ['login', 'urgente', 'marketing'],
    comments: [
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'admin-1',
        userName: 'Admin Demo',
        text: 'Este texto es prioritario para la campaña de marketing',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
      }
    ],
    history: [
      {
        id: uuidv4(),
        copyId: uuidv4(), // Se actualizará después
        userId: 'admin-1',
        userName: 'Admin Demo',
        previousStatus: 'not_assigned',
        newStatus: 'assigned',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        comments: 'Asignado con prioridad alta'
      }
    ]
  },
  {
    id: uuidv4(),
    slug: 'login.email',
    text: 'Email address',
    language: 'en',
    status: 'translated',
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
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    tags: ['login', 'legal', 'seguridad'],
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
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  // Mismo texto que en español pero en inglés (para pruebas multiidioma)
  {
    id: uuidv4(),
    slug: 'dashboard.welcome',
    text: 'Welcome to the dashboard',
    language: 'en',
    status: 'translated',
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
    status: 'translated',
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
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  // Slug sin texto asignado en italiano
  {
    id: uuidv4(),
    slug: 'nav.settings',
    text: '',
    language: 'it',
    status: 'not_assigned',
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
    status: 'translated',
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
    status: 'not_assigned',
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
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  // Copy con slug que tiene puntos anidados para probar conflictos
  {
    id: uuidv4(),
    slug: 'button',
    text: 'Knopf',
    language: 'de',
    status: 'not_assigned',
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
    status: 'not_assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    id: uuidv4(),
    slug: 'button.save',
    text: 'Salvar',
    language: 'pt',
    status: 'not_assigned',
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
