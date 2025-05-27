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
    // Cargar datos iniciales
    setLoading(true);
    const initialCopys = dataService.getCopys();
    setCopys(initialCopys);
    setLoading(false);

    // Suscribirse a cambios
    const unsubscribe = dataService.subscribe('copys', (newCopys) => {
      console.log('[useCopys] Copys actualizados:', newCopys.length);
      setCopys(newCopys);
    });

    return unsubscribe;
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    const currentCopys = dataService.getCopys();
    setCopys(currentCopys);
    setLoading(false);
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
