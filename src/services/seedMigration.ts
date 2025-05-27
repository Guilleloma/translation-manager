import connectDB from '../lib/mongodb';
import User from '../models/User';
import Copy from '../models/Copy';
import { seedUsers, seedCopys } from '../utils/seedData';

/**
 * Servicio para migrar datos de seed a MongoDB
 * Permite transferir los datos de ejemplo desde localStorage a la base de datos
 */

/**
 * Migra usuarios de seed a MongoDB
 */
export async function migrateUsersToMongoDB(): Promise<void> {
  try {
    await connectDB();
    
    console.log(' Iniciando migración de usuarios a MongoDB...');
    
    // Verificar si ya existen usuarios en la BD
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount > 0) {
      console.log(` Ya existen ${existingUsersCount} usuarios en MongoDB. Saltando migración de usuarios.`);
      return;
    }
    
    // Migrar usuarios de seed
    const usersToInsert = seedUsers.map(user => ({
      ...user,
      _id: undefined // Dejar que MongoDB genere el ID
    }));
    
    const insertedUsers = await User.insertMany(usersToInsert);
    console.log(` ${insertedUsers.length} usuarios migrados exitosamente a MongoDB`);
    
    // Mostrar usuarios creados
    insertedUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.email}`);
    });
    
  } catch (error) {
    console.error(' Error migrando usuarios a MongoDB:', error);
    throw error;
  }
}

/**
 * Migra copys de seed a MongoDB
 */
export async function migrateCopysToMongoDB(): Promise<void> {
  try {
    await connectDB();
    
    console.log(' Iniciando migración de copys a MongoDB...');
    
    // Verificar si ya existen copys en la BD
    const existingCopysCount = await Copy.countDocuments();
    if (existingCopysCount > 0) {
      console.log(` Ya existen ${existingCopysCount} copys en MongoDB. Saltando migración de copys.`);
      return;
    }
    
    // Obtener usuarios de MongoDB para mapear IDs
    const users = await User.find();
    const userMap = new Map(users.map(user => [user.email, user._id.toString()]));
    
    // Mapear copys de seed a formato MongoDB
    const copysToInsert = seedCopys.map(copy => {
      // Excluir explícitamente comentarios e historial usando destructuring
      const { 
        id, 
        comments, 
        history, 
        ...copyData 
      } = copy;
      
      const newCopy: any = {
        slug: copyData.slug || '',
        text: copyData.text,
        language: copyData.language,
        status: copyData.status,
        createdAt: copyData.createdAt,
        updatedAt: copyData.updatedAt,
        tags: copyData.tags || [],
        isBulkImport: false
      };
      
      // Mapear assignedTo si existe
      if (copyData.assignedTo) {
        const seedUser = seedUsers.find(u => u.id === copyData.assignedTo);
        if (seedUser) {
          const mongoUserId = userMap.get(seedUser.email);
          if (mongoUserId) {
            newCopy.assignedTo = mongoUserId;
            newCopy.assignedAt = copyData.assignedAt;
          }
        }
      }
      
      // Mapear fechas adicionales
      if (copyData.completedAt) newCopy.completedAt = copyData.completedAt;
      
      // Mapear reviewedBy si existe
      if (copyData.reviewedBy) {
        const seedUser = seedUsers.find(u => u.id === copyData.reviewedBy);
        if (seedUser) {
          const mongoUserId = userMap.get(seedUser.email);
          if (mongoUserId) {
            newCopy.reviewedBy = mongoUserId;
            newCopy.reviewedAt = copyData.reviewedAt;
          }
        }
      }
      
      // Mapear approvedBy si existe
      if (copyData.approvedBy) {
        const seedUser = seedUsers.find(u => u.id === copyData.approvedBy);
        if (seedUser) {
          const mongoUserId = userMap.get(seedUser.email);
          if (mongoUserId) {
            newCopy.approvedBy = mongoUserId;
            newCopy.approvedAt = copyData.approvedAt;
          }
        }
      }
      
      // Los comentarios e historial se han excluido mediante destructuring
      // y no se incluirán en newCopy
      
      return newCopy;
    });
    
    const insertedCopys = await Copy.insertMany(copysToInsert);
    console.log(` ${insertedCopys.length} copys migrados exitosamente a MongoDB`);
    
    // Mostrar estadísticas de migración
    const languageStats = insertedCopys.reduce((acc, copy) => {
      acc[copy.language] = (acc[copy.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(' Estadísticas de migración por idioma:');
    Object.entries(languageStats).forEach(([lang, count]) => {
      console.log(`   - ${lang}: ${count} copys`);
    });
    
  } catch (error) {
    console.error(' Error migrando copys a MongoDB:', error);
    throw error;
  }
}

/**
 * Migra todos los datos de seed a MongoDB
 */
export async function migrateAllSeedDataToMongoDB(): Promise<void> {
  try {
    console.log(' Iniciando migración completa de datos seed a MongoDB...');
    
    // Migrar usuarios primero (los copys pueden referenciarlos)
    await migrateUsersToMongoDB();
    
    // Luego migrar copys
    await migrateCopysToMongoDB();
    
    console.log(' Migración completa exitosa!');
    
  } catch (error) {
    console.error(' Error en migración completa:', error);
    throw error;
  }
}

/**
 * Limpia todos los datos de MongoDB (útil para testing)
 */
export async function clearAllMongoDBData(): Promise<void> {
  try {
    await connectDB();
    
    console.log(' Limpiando todos los datos de MongoDB...');
    
    await User.deleteMany({});
    await Copy.deleteMany({});
    
    console.log(' Todos los datos han sido eliminados de MongoDB');
    
  } catch (error) {
    console.error(' Error limpiando datos de MongoDB:', error);
    throw error;
  }
}

/**
 * Verifica el estado de la migración
 */
export async function checkMigrationStatus(): Promise<{
  usersCount: number;
  copysCount: number;
  isComplete: boolean;
}> {
  try {
    await connectDB();
    
    const usersCount = await User.countDocuments();
    const copysCount = await Copy.countDocuments();
    
    const isComplete = usersCount > 0 && copysCount > 0;
    
    return {
      usersCount,
      copysCount,
      isComplete
    };
    
  } catch (error) {
    console.error(' Error verificando estado de migración:', error);
    throw error;
  }
}
