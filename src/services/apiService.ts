/**
 * Servicio para interactuar con la API de sincronización de MongoDB
 * Proporciona métodos para sincronizar datos entre el cliente y el servidor
 */

import { Copy } from '../types/copy';
import { User } from '../types/user';

// Tipos para las operaciones de API
type Entity = 'copy' | 'user';
type Action = 'create' | 'update' | 'delete' | 'sync';

// Interfaz para la respuesta de la API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private apiUrl = '/api/db/sync';
  
  /**
   * Obtiene todos los datos (copys y usuarios) del servidor
   */
  async fetchAllData(): Promise<{ copys: Copy[], users: User[] } | null> {
    try {
      console.log('[ApiService] Obteniendo datos del servidor...');
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result: ApiResponse<{ copys: Copy[], users: User[] }> = await response.json();
      
      if (!result.success || !result.data) {
        console.error('[ApiService] Error en la respuesta:', result.error);
        return null;
      }
      
      console.log(`[ApiService] Datos obtenidos: ${result.data.copys.length} copys, ${result.data.users.length} usuarios`);
      return result.data;
    } catch (error) {
      console.error('[ApiService] Error al obtener datos:', error);
      return null;
    }
  }
  
  /**
   * Crea un nuevo documento en el servidor
   */
  async createDocument<T>(entity: Entity, data: T): Promise<T | null> {
    try {
      console.log(`[ApiService] Creando ${entity}:`, data);
      
      // Determinar la URL del endpoint específico
      const endpoint = entity === 'copy' ? '/api/copys' : '/api/users';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ApiService] Error HTTP ${response.status}:`, errorText);
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success || !result.data) {
        console.error('[ApiService] Error en la respuesta:', result.error);
        throw new Error(result.error || 'Error desconocido');
      }
      
      console.log(`[ApiService] ${entity} creado exitosamente`);
      return result.data;
    } catch (error) {
      console.error(`[ApiService] Error al crear ${entity}:`, error);
      throw error; // Re-lanzar el error para que el caller pueda manejarlo
    }
  }
  
  /**
   * Actualiza un documento existente en el servidor
   */
  async updateDocument<T extends { id: string }>(entity: Entity, data: T): Promise<T | null> {
    try {
      console.log(`[ApiService] Actualizando ${entity} ${data.id}`);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          entity,
          data
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        console.error('[ApiService] Error en la respuesta:', result.error);
        return null;
      }
      
      console.log(`[ApiService] ${entity} actualizado exitosamente`);
      return result.data || null;
    } catch (error) {
      console.error(`[ApiService] Error al actualizar ${entity}:`, error);
      return null;
    }
  }
  
  /**
   * Elimina un documento del servidor
   */
  async deleteDocument(entity: Entity, id: string): Promise<boolean> {
    try {
      console.log(`[ApiService] Eliminando ${entity} ${id}`);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          entity,
          data: { id }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        console.error('[ApiService] Error en la respuesta:', result.error);
        return false;
      }
      
      console.log(`[ApiService] ${entity} eliminado exitosamente`);
      return true;
    } catch (error) {
      console.error(`[ApiService] Error al eliminar ${entity}:`, error);
      return false;
    }
  }
  
  /**
   * Sincroniza una colección completa con el servidor
   */
  async syncCollection<T>(entity: Entity, data: T[]): Promise<boolean> {
    try {
      console.log(`[ApiService] Sincronizando colección de ${entity}s: ${data.length} elementos`);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync',
          entity,
          data
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        console.error('[ApiService] Error en la respuesta:', result.error);
        return false;
      }
      
      console.log(`[ApiService] Colección de ${entity}s sincronizada exitosamente:`, result.message);
      return true;
    } catch (error) {
      console.error(`[ApiService] Error al sincronizar colección de ${entity}s:`, error);
      return false;
    }
  }
}

// Exportar una instancia única del servicio
const apiService = new ApiService();
export default apiService;
