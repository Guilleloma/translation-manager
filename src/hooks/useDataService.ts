/**
 * Hook personalizado para usar el servicio de datos de manera reactiva
 */

import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';
import { Copy } from '../types/copy';
import { User } from '../types/user';

export function useCopys() {
  const [copys, setCopys] = useState<Copy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos iniciales de forma asíncrona
    const loadInitialCopys = async () => {
      setLoading(true);
      try {
        const initialCopys = await dataService.getCopys();
        setCopys(initialCopys);
      } catch (error) {
        console.error('[useCopys] Error al cargar copys iniciales:', error);
        setCopys([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialCopys();

    // Suscribirse a cambios
    const unsubscribe = dataService.subscribe('copys', (newCopys) => {
      console.log('[useCopys] Copys actualizados:', newCopys.length);
      setCopys(newCopys);
    });

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const currentCopys = await dataService.getCopys();
      setCopys(currentCopys);
    } catch (error) {
      console.error('[useCopys] Error al refrescar copys:', error);
      setCopys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { copys, loading, refresh };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos iniciales
    setLoading(true);
    const initialUsers = dataService.getUsers();
    setUsers(initialUsers);
    setLoading(false);

    // Suscribirse a cambios
    const unsubscribe = dataService.subscribe('users', (newUsers) => {
      console.log('[useUsers] Usuarios actualizados:', newUsers.length);
      setUsers(newUsers);
    });

    return unsubscribe;
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    const currentUsers = dataService.getUsers();
    setUsers(currentUsers);
    setLoading(false);
  }, []);

  return { users, loading, refresh };
}
