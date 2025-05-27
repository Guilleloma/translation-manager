/**
 * Servicio de datos centralizado
 * Esta capa de abstracción facilita la futura migración a una base de datos
 */

import { Copy } from '../types/copy';
import { User } from '../types/user';

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
    }
  }

  // Métodos para copys
  getCopys(): Copy[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const copysStr = localStorage.getItem('copys');
      if (copysStr) {
        const copys = JSON.parse(copysStr);
        console.log(`[DataService] Copys cargados: ${copys.length}`);
        return copys;
      }
    } catch (error) {
      console.error('[DataService] Error al cargar copys:', error);
    }
    return [];
  }

  setCopys(copys: Copy[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('copys', JSON.stringify(copys));
      console.log(`[DataService] Copys guardados: ${copys.length}`);
      this.notifyListeners('copys', copys);
    } catch (error) {
      console.error('[DataService] Error al guardar copys:', error);
    }
  }

  addCopy(copy: Copy): void {
    const copys = this.getCopys();
    copys.push(copy);
    this.setCopys(copys);
  }

  updateCopy(copyId: string, updates: Partial<Copy>): void {
    const copys = this.getCopys();
    const index = copys.findIndex(c => c.id === copyId);
    if (index !== -1) {
      copys[index] = { ...copys[index], ...updates };
      this.setCopys(copys);
    }
  }

  deleteCopy(copyId: string): void {
    const copys = this.getCopys();
    const filtered = copys.filter(c => c.id !== copyId);
    this.setCopys(filtered);
  }

  // Métodos para usuarios
  getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const usersStr = localStorage.getItem('users');
      if (usersStr) {
        return JSON.parse(usersStr);
      }
    } catch (error) {
      console.error('[DataService] Error al cargar usuarios:', error);
    }
    return [];
  }

  setUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('users', JSON.stringify(users));
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
  refreshData(): void {
    console.log('[DataService] Forzando recarga de datos...');
    this.notifyListeners('copys', this.getCopys());
    this.notifyListeners('users', this.getUsers());
  }

  // Método de debug
  debug(): void {
    const copys = this.getCopys();
    const users = this.getUsers();
    
    console.log('=== DataService Debug ===');
    console.log(`Copys: ${copys.length}`);
    console.log(`Users: ${users.length}`);
    
    // Estadísticas de copys
    const byLanguage: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    copys.forEach(copy => {
      byLanguage[copy.language] = (byLanguage[copy.language] || 0) + 1;
      byStatus[copy.status] = (byStatus[copy.status] || 0) + 1;
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
}

// Singleton
const dataService = new DataService();

// Exportar instancia y hacer disponible globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).dataService = dataService;
}

export default dataService;
