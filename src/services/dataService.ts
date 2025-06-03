/**
 * Servicio de datos centralizado
 * Esta capa de abstracción facilita el uso de múltiples fuentes de datos
 * y la transición entre almacenamiento local y MongoDB
 */

import { Copy } from '../types/copy';
import { User } from '../types/user';
import apiService from './apiService';

// Importaciones dinámicas para evitar errores en el cliente
let connectDB: any = null;
let CopyModel: any = null;
let UserModel: any = null;

// Solo importar en el servidor
if (typeof window === 'undefined') {
  try {
    const mongoModule = require('../lib/mongodb');
    const copyModule = require('../models/Copy');
    const userModule = require('../models/User');
    
    connectDB = mongoModule.connectDB;
    CopyModel = copyModule.default;
    UserModel = userModule.default;
  } catch (error) {
    console.warn('[DataService] MongoDB modules not available:', error);
  }
}

// Event emitter para notificar cambios
type DataChangeListener = (data: any) => void;

class DataService {
  private listeners: {
    copys: DataChangeListener[];
    users: DataChangeListener[];
  } = {
    copys: [],
    users: []
  };
  
  private isInitialized = false;
  private initialLoadPromise: Promise<void> | null = null;
  private useMongoDBPrimary = typeof window === 'undefined'; // Usar MongoDB solo en el servidor

  constructor() {
    // Escuchar cambios en localStorage desde otras pestañas
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'copys') {
          this.notifyListeners('copys', this.getCopys());
        } else if (e.key === 'users') {
          this.notifyListeners('users', this.getUsers());
        }
      });
      
      // Iniciar carga de datos desde MongoDB al arrancar
      this.initializeData();
    }
  }
  
  // Inicializa datos desde MongoDB o localStorage
  private async initializeData(): Promise<void> {
    if (this.initialLoadPromise) return this.initialLoadPromise;
    
    this.initialLoadPromise = new Promise<void>(async (resolve) => {
      try {
        // Verificar si estamos en el servidor y podemos usar MongoDB
        if (typeof window === 'undefined' && connectDB) {
          console.log('[DataService] Inicializando datos desde MongoDB (servidor)...');
          await connectDB();
          
          // Verificar si la base de datos está vacía y ejecutar migración si es necesario
          const usersCount = await UserModel.countDocuments();
          if (usersCount === 0) {
            console.log('[DataService] Base de datos vacía, cargando datos semilla...');
            // La base de datos está vacía, pero ya no necesitamos migración automática
            // Los datos se crearán conforme se vayan añadiendo
          }
          
          // Cargar datos desde MongoDB
          const copysFromDB = await CopyModel.find().lean();
          const usersFromDB = await UserModel.find().lean();
          
          console.log(`[DataService] Datos cargados desde MongoDB: ${copysFromDB.length} copys, ${usersFromDB.length} usuarios`);
          
          // Transformar documentos de MongoDB a objetos normales para la aplicación
          const copys = copysFromDB.map(this.transformMongoDBCopyToApp);
          const users = usersFromDB.map(this.transformMongoDBUserToApp);
          
          // Notificar a los listeners
          this.notifyListeners('copys', copys);
          this.notifyListeners('users', users);
          
          this.isInitialized = true;
          console.log('[DataService] Inicialización completa desde MongoDB');
          resolve();
          return;
        }
        
        // Si estamos en el cliente, intentar obtener datos del servidor primero
        if (typeof window !== 'undefined') {
          try {
            console.log('[DataService] Intentando obtener datos del servidor via API...');
            const serverData = await apiService.fetchAllData();
            
            if (serverData) {
              console.log(`[DataService] Datos obtenidos del servidor: ${serverData.copys.length} copys, ${serverData.users.length} usuarios`);
              
              // Actualizar localStorage con los datos del servidor
              localStorage.setItem('copys', JSON.stringify(serverData.copys));
              localStorage.setItem('users', JSON.stringify(serverData.users));
              
              // Notificar a los listeners
              this.notifyListeners('copys', serverData.copys);
              this.notifyListeners('users', serverData.users);
              
              this.isInitialized = true;
              console.log('[DataService] Inicialización completa desde API');
              resolve();
              return;
            }
          } catch (apiError) {
            console.error('[DataService] Error al obtener datos del servidor:', apiError);
            console.log('[DataService] Usando localStorage como fallback...');
          }
          
          // Si no se pudieron obtener datos del servidor, usar localStorage
          console.log('[DataService] Inicializando datos desde localStorage...');
          
          // Notificar con datos de localStorage
          const copys = this.getLocalCopys();
          const users = this.getLocalUsers();
          
          this.notifyListeners('copys', copys);
          this.notifyListeners('users', users);
          
          console.log(`[DataService] Datos cargados desde localStorage: ${copys.length} copys, ${users.length} usuarios`);
          this.isInitialized = true;
          resolve();
          return;
        }
        
        // Si llegamos aquí, no tenemos datos
        console.log('[DataService] No hay fuente de datos disponible');
        this.isInitialized = true;
        resolve();
      } catch (error) {
        console.error('[DataService] Error inicializando datos:', error);
        console.log('[DataService] Usando datos de localStorage como fallback');
        
        // Notificar con datos de localStorage si estamos en el cliente
        if (typeof window !== 'undefined') {
          this.notifyListeners('copys', this.getLocalCopys());
          this.notifyListeners('users', this.getLocalUsers());
        }
        
        this.isInitialized = true;
        resolve();
      }
    });
    
    return this.initialLoadPromise;
  }
  
  // Transformadores entre MongoDB y App
  private transformMongoDBCopyToApp(dbCopy: any): Copy {
    return {
      id: dbCopy._id.toString(),
      slug: dbCopy.slug,
      text: dbCopy.text,
      language: dbCopy.language,
      status: dbCopy.status,
      createdAt: dbCopy.createdAt,
      updatedAt: dbCopy.updatedAt,
      assignedTo: dbCopy.assignedTo?.toString(),
      assignedAt: dbCopy.assignedAt,
      completedAt: dbCopy.completedAt,
      reviewedBy: dbCopy.reviewedBy?.toString(),
      reviewedAt: dbCopy.reviewedAt,
      approvedBy: dbCopy.approvedBy?.toString(),
      approvedAt: dbCopy.approvedAt,
      tags: Array.isArray(dbCopy.tags) ? dbCopy.tags : (dbCopy.tags ? [dbCopy.tags] : []),
      comments: dbCopy.comments || [],
      history: dbCopy.history || [],
      isBulkImport: dbCopy.isBulkImport || false,
      needsSlugReview: dbCopy.needsSlugReview || false, // Añadir la propiedad needsSlugReview
      metadata: dbCopy.metadata || {}
    };
  }
  
  private transformMongoDBUserToApp(dbUser: any): User {
    return {
      id: dbUser._id.toString(),
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      languages: dbUser.languages || [],
      isActive: dbUser.isActive || true
    };
  }
  
  // Obtener datos desde localStorage (caché)
  private getLocalCopys(): Copy[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const copysStr = localStorage.getItem('copys');
      if (copysStr) {
        const copys = JSON.parse(copysStr);
        console.log(`[DataService] Copys cargados de localStorage: ${copys.length}`);
        return copys;
      }
    } catch (error) {
      console.error('[DataService] Error al cargar copys de localStorage:', error);
    }
    return [];
  }
  
  private getLocalUsers(): User[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const usersStr = localStorage.getItem('users');
      if (usersStr) {
        return JSON.parse(usersStr);
      }
    } catch (error) {
      console.error('[DataService] Error al cargar usuarios de localStorage:', error);
    }
    return [];
  }

  // Métodos para copys
  async getCopys(): Promise<Copy[]> {
    // Asegurar inicialización
    if (!this.isInitialized) {
      await this.initializeData();
    }
    
    // Si estamos en el servidor y podemos usar MongoDB
    if (typeof window === 'undefined' && connectDB && CopyModel) {
      try {
        await connectDB();
        // Ordenar por fecha de creación descendente (más recientes primero)
        const copysFromDB = await CopyModel.find().sort({ createdAt: -1 }).lean();
        const copys = copysFromDB.map(this.transformMongoDBCopyToApp);
        
        console.log(`[DataService] Copys cargados desde MongoDB (servidor): ${copys.length}`);
        return copys;
      } catch (error) {
        console.error('[DataService] Error al cargar copys desde MongoDB:', error);
        return [];
      }
    } else {
      // Si estamos en el cliente, usar localStorage y ordenar por fecha
      const localCopys = this.getLocalCopys();
      // Ordenar por fecha de creación descendente (más recientes primero)
      return localCopys.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Orden descendente
      });
    }
  }

  // Versión sincrónica para compatibilidad
  getCopysSync(): Copy[] {
    return this.getLocalCopys();
  }

  async setCopys(copys: Copy[]): Promise<void> {
    try {
      // Si estamos en el cliente, guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('copys', JSON.stringify(copys));
        console.log(`[DataService] Copys guardados en localStorage: ${copys.length}`);
      }
      
      // Si estamos en el servidor y podemos usar MongoDB
      if (typeof window === 'undefined' && connectDB && CopyModel) {
        try {
          await connectDB();
          
          // Eliminar todos los copys y reemplazarlos (enfoque simple)
          await CopyModel.deleteMany({});
          
          // Transformar y guardar
          const copysToSave = copys.map(copy => ({
            _id: copy.id,
            slug: copy.slug,
            text: copy.text,
            language: copy.language,
            status: copy.status,
            createdAt: copy.createdAt,
            updatedAt: copy.updatedAt,
            assignedTo: copy.assignedTo,
            assignedAt: copy.assignedAt,
            completedAt: copy.completedAt,
            reviewedBy: copy.reviewedBy,
            reviewedAt: copy.reviewedAt,
            approvedBy: copy.approvedBy,
            approvedAt: copy.approvedAt,
            tags: copy.tags || [],
            comments: copy.comments || [],
            history: copy.history || [],
            isBulkImport: copy.isBulkImport || false
          }));
          
          await CopyModel.insertMany(copysToSave);
          console.log(`[DataService] ${copys.length} copys guardados en MongoDB`);
        } catch (error) {
          console.error('[DataService] Error al guardar copys en MongoDB:', error);
        }
      }
      
      // Notificar a los listeners en cualquier caso
      this.notifyListeners('copys', copys);
    } catch (error) {
      console.error('[DataService] Error al guardar copys:', error);
    }
  }

  async addCopy(copy: Copy): Promise<void> {
    // Guardar en localStorage si estamos en el cliente
    if (typeof window !== 'undefined') {
      // Primero intentar sincronizar con el servidor
      try {
        const serverCopy = await apiService.createDocument('copy', copy);
        if (serverCopy) {
          console.log(`[DataService] Copy sincronizado con el servidor via API`);
          
          // Usar el copy devuelto por el servidor (con el ID correcto)
          const finalCopy = { ...copy, ...serverCopy };
          
          // Agregar a la lista en memoria
          const copys = await this.getCopys();
          copys.push(finalCopy);
          
          // Guardar en localStorage y notificar
          localStorage.setItem('copys', JSON.stringify(copys));
          this.notifyListeners('copys', copys);
          
          return;
        }
      } catch (error) {
        console.error('[DataService] Error al sincronizar copy con el servidor:', error);
        console.warn('[DataService] Guardando copy solo localmente como fallback');
      }
      
      // Fallback: guardar solo localmente si falla la sincronización
      const copys = await this.getCopys();
      copys.push(copy);
      localStorage.setItem('copys', JSON.stringify(copys));
      this.notifyListeners('copys', copys);
    }
    
    // Versión optimizada para MongoDB (solo en el servidor)
    if (typeof window === 'undefined' && connectDB && CopyModel) {
      try {
        await connectDB();
        
        const copyToSave = {
          _id: copy.id,
          slug: copy.slug,
          text: copy.text,
          language: copy.language,
          status: copy.status,
          createdAt: copy.createdAt,
          updatedAt: copy.updatedAt,
          assignedTo: copy.assignedTo,
          assignedAt: copy.assignedAt,
          completedAt: copy.completedAt,
          reviewedBy: copy.reviewedBy,
          reviewedAt: copy.reviewedAt,
          approvedBy: copy.approvedBy,
          approvedAt: copy.approvedAt,
          tags: copy.tags || [],
          comments: copy.comments || [],
          history: copy.history || [],
          isBulkImport: copy.isBulkImport || false,
          needsSlugReview: copy.needsSlugReview !== undefined ? copy.needsSlugReview : true, // Por defecto true
          metadata: copy.metadata || {}
        };
        
        await CopyModel.create(copyToSave);
        console.log(`[DataService] Copy ${copy.id} guardado directamente en MongoDB`);
      } catch (error) {
        console.error('[DataService] Error al guardar copy en MongoDB:', error);
      }
    } else {
      // Si no estamos en el servidor o no podemos usar MongoDB, usar setCopys
      const copys = await this.getCopys();
      copys.push(copy);
      await this.setCopys(copys);
    }
  }

  async updateCopy(copyId: string, updates: Partial<Copy>): Promise<void> {
    console.log('🔄 [DataService] updateCopy llamado:', { copyId, updates });
    
    // Actualizar en memoria
    const copys = await this.getCopys();
    console.log(`📊 [DataService] Total copys antes de actualizar: ${copys.length}`);
    
    const index = copys.findIndex(c => c.id === copyId);
    if (index !== -1) {
      console.log(`🎯 [DataService] Copy encontrado en índice ${index}:`, copys[index]);
      
      // Si updates tiene un id, usar el copy completo; si no, hacer merge
      if (updates.id && updates.slug && updates.text && updates.language) {
        // Es un copy completo, reemplazar
        console.log('🔄 [DataService] Reemplazando copy completo');
        copys[index] = updates as Copy;
      } else {
        // Es una actualización parcial, hacer merge
        console.log('🔄 [DataService] Haciendo merge parcial');
        copys[index] = { ...copys[index], ...updates };
      }
      
      console.log(`✅ [DataService] Copy actualizado:`, copys[index]);
      console.log(`📊 [DataService] Total copys después de actualizar: ${copys.length}`);
      
      // Actualizar localStorage si estamos en el cliente
      if (typeof window !== 'undefined') {
        localStorage.setItem('copys', JSON.stringify(copys));
        this.notifyListeners('copys', copys);
        
        // Sincronizar con el servidor mediante API
        try {
          const updatedCopy = { ...copys[index] };
          await apiService.updateDocument('copy', updatedCopy);
          console.log(`[DataService] Copy ${copyId} actualizado en el servidor via API`);
        } catch (error) {
          console.error('[DataService] Error al actualizar copy en el servidor:', error);
        }
      }
    } else {
      console.log(`❌ [DataService] No se encontró el copy ${copyId} para actualizar`);
      return;
    }
    
    // Actualizar en MongoDB si estamos en el servidor
    if (typeof window === 'undefined' && connectDB && CopyModel) {
      try {
        await connectDB();
        await CopyModel.updateOne({ _id: copyId }, { $set: updates });
        console.log(`[DataService] Copy ${copyId} actualizado en MongoDB`);
      } catch (error) {
        console.error('[DataService] Error al actualizar copy en MongoDB:', error);
      }
    } else {
      // Si no estamos en el servidor o no podemos usar MongoDB, usar setCopys
      await this.setCopys(copys);
    }
  }

  async deleteCopy(copyId: string): Promise<void> {
    // Eliminar de memoria
    const copys = await this.getCopys();
    const filtered = copys.filter(c => c.id !== copyId);
    
    // Actualizar localStorage si estamos en el cliente
    if (typeof window !== 'undefined') {
      localStorage.setItem('copys', JSON.stringify(filtered));
      this.notifyListeners('copys', filtered);
      
      // Sincronizar con el servidor mediante API
      try {
        await apiService.deleteDocument('copy', copyId);
        console.log(`[DataService] Copy ${copyId} eliminado del servidor via API`);
      } catch (error) {
        console.error('[DataService] Error al eliminar copy del servidor:', error);
      }
    }
    
    // Eliminar de MongoDB si estamos en el servidor
    if (typeof window === 'undefined' && connectDB && CopyModel) {
      try {
        await connectDB();
        await CopyModel.deleteOne({ _id: copyId });
        console.log(`[DataService] Copy ${copyId} eliminado de MongoDB`);
      } catch (error) {
        console.error('[DataService] Error al eliminar copy de MongoDB:', error);
      }
    } else {
      // Si no estamos en el servidor o no podemos usar MongoDB, usar setCopys
      await this.setCopys(filtered);
    }
  }

  // Método para forzar recarga desde el servidor (bypass localStorage)
  async getCopysFromServer(): Promise<Copy[]> {
    console.log('🔄 [DataService] Forzando recarga desde servidor...');
    
    if (typeof window !== 'undefined') {
      // En el cliente, usar la API para obtener datos frescos
      try {
        const serverData = await apiService.fetchAllData();
        if (serverData && serverData.copys) {
          console.log(`📊 [DataService] Copys obtenidos del servidor: ${serverData.copys.length}`);
          
          // Actualizar localStorage con los datos frescos
          localStorage.setItem('copys', JSON.stringify(serverData.copys));
          
          // Notificar listeners
          this.notifyListeners('copys', serverData.copys);
          
          return serverData.copys.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // Orden descendente
          });
        }
      } catch (error) {
        console.error('[DataService] Error al obtener copys del servidor:', error);
      }
    }
    
    // Fallback a método normal
    return this.getCopys();
  }

  // Métodos para usuarios
  async getUsers(): Promise<User[]> {
    // Asegurar inicialización
    if (!this.isInitialized) {
      await this.initializeData();
    }
    
    // Si estamos en el servidor y podemos usar MongoDB
    if (typeof window === 'undefined' && connectDB && UserModel) {
      try {
        await connectDB();
        const usersFromDB = await UserModel.find().lean();
        const users = usersFromDB.map(this.transformMongoDBUserToApp);
        
        console.log(`[DataService] Usuarios cargados desde MongoDB (servidor): ${users.length}`);
        return users;
      } catch (error) {
        console.error('[DataService] Error al cargar usuarios desde MongoDB:', error);
        return [];
      }
    } else {
      // Si estamos en el cliente, usar localStorage
      return this.getLocalUsers();
    }
  }
  
  // Versión sincrónica para compatibilidad
  getUsersSync(): User[] {
    return this.getLocalUsers();
  }

  async setUsers(users: User[]): Promise<void> {
    try {
      // Si estamos en el cliente, guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('users', JSON.stringify(users));
        console.log(`[DataService] Usuarios guardados en localStorage: ${users.length}`);
      }
      
      // Si estamos en el servidor y podemos usar MongoDB
      if (typeof window === 'undefined' && connectDB && UserModel) {
        try {
          await connectDB();
          
          // Eliminar todos los usuarios y reemplazarlos (enfoque simple)
          await UserModel.deleteMany({});
          
          // Transformar y guardar
          const usersToSave = users.map(user => ({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            languages: user.languages || [],
            isActive: user.isActive || true
          }));
          
          await UserModel.insertMany(usersToSave);
          console.log(`[DataService] ${users.length} usuarios guardados en MongoDB`);
        } catch (error) {
          console.error('[DataService] Error al guardar usuarios en MongoDB:', error);
        }
      }
      
      // Notificar a los listeners en cualquier caso
      this.notifyListeners('users', users);
    } catch (error) {
      console.error('[DataService] Error al guardar usuarios:', error);
    }
  }

  // Sistema de suscripción para cambios
  subscribe(type: 'copys' | 'users', listener: DataChangeListener): () => void {
    this.listeners[type].push(listener);
    
    // Retornar función para desuscribirse
    return () => {
      const index = this.listeners[type].indexOf(listener);
      if (index > -1) {
        this.listeners[type].splice(index, 1);
      }
    };
  }

  private notifyListeners(type: 'copys' | 'users', data: any): void {
    this.listeners[type].forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`[DataService] Error en listener de ${type}:`, error);
      }
    });
  }

  // Método para forzar recarga de datos
  // Se utiliza para actualizar todos los datos en la aplicación cuando hay cambios importantes
  async refreshData(): Promise<void> {
    console.log('🔄 [DataService] Forzando recarga de datos...');
    
    try {
      // Si estamos en un refresh completo, reiniciar el estado de inicialización
      this.isInitialized = false;
      this.initialLoadPromise = null;
      
      // Cargar datos frescos desde la fuente apropiada (MongoDB en servidor, API en cliente)
      await this.initializeData();
      
      // Obtener los datos actualizados
      const copys = await this.getCopys();
      const users = await this.getUsers();
      
      // Notificar a los listeners con los datos actualizados
      this.notifyListeners('copys', copys);
      this.notifyListeners('users', users);
      
      // Emitir evento global para que otros componentes se actualicen
      if (typeof window !== 'undefined') {
        console.log(`📢 [DataService] Notificando actualización global: ${copys.length} copys`);
        window.dispatchEvent(new Event('dataServiceRefreshed'));
      }
      
      console.log(`✅ [DataService] Recarga de datos completada: ${copys.length} copys`);
      return Promise.resolve();
    } catch (error) {
      console.error('❌ [DataService] Error al recargar datos:', error);
      return Promise.reject(error);
    }
  }

  // Log de debug para analizar el estado de los copys
  debugCopys() {
    const copys = this.getCopysSync();
    
    if (!copys.length) {
      console.log('No hay copys disponibles');
      return;
    }
    
    console.log('========================');
    console.log(`ESTADO ACTUAL DE COPYS: ${copys.length} total`);
    
    // Contar por idioma
    const byLanguage: Record<string, number> = {};
    
    // Contar por estado
    const byStatus: Record<string, number> = {};
    
    copys.forEach(copy => {
      // Contar por idioma
      if (!byLanguage[copy.language]) {
        byLanguage[copy.language] = 0;
      }
      byLanguage[copy.language]++;
      
      // Contar por estado
      if (!byStatus[copy.status]) {
        byStatus[copy.status] = 0;
      }
      byStatus[copy.status]++;
    });
    
    console.log('\nCopys por idioma:');
    Object.entries(byLanguage).forEach(([lang, count]) => {
      console.log(`  ${lang}: ${count}`);
    });
    
    console.log('\nCopys por estado:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    console.log('========================');
  }
  
  /**
   * Elimina todos los copys de la base de datos
   * Esta operación es irreversible y solo debe ser utilizada por administradores
   * No afecta a la base de datos de usuarios
   * 
   * @returns Promise con el resultado de la operación
   */
  async deleteAllCopys(): Promise<{ success: boolean; message: string; deletedCount?: number }> {
    console.log('⚠️ [DataService] Eliminando todos los copys...');
    
    try {
      // Llamar al endpoint de API para eliminar todos los copys
      const response = await fetch('/api/db/reset-copies', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [DataService] Error al eliminar copys:', errorData);
        return {
          success: false,
          message: errorData.message || 'Error al eliminar los copys'
        };
      }
      
      const result = await response.json();
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('copys');
      }
      
      // Forzar recarga de datos
      await this.refreshData();
      
      console.log(`✅ [DataService] Eliminados ${result.deletedCount} copys`);
      
      return {
        success: true,
        message: result.message || `Se han eliminado ${result.deletedCount} copys`,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('❌ [DataService] Error al eliminar copys:', error);
      return {
        success: false,
        message: (error as Error).message || 'Error al eliminar los copys'
      };
    }
  }
}

// Singleton
const dataService = new DataService();

// Exportar instancia y hacer disponible globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).dataService = dataService;
}

export default dataService;
