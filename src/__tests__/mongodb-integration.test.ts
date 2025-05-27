/**
 * Tests de integración para MongoDB
 * Verifica que la migración y las operaciones básicas funcionen correctamente
 */

import { 
  migrateAllSeedDataToMongoDB, 
  checkMigrationStatus, 
  clearAllMongoDBData 
} from '../services/seedMigration';
import connectDB from '../lib/mongodb';
import User from '../models/User';
import Copy from '../models/Copy';

// Mock de console.log para tests más limpios
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('MongoDB Integration Tests', () => {
  beforeEach(async () => {
    // Limpiar la base de datos antes de cada test
    await clearAllMongoDBData();
  });

  afterAll(async () => {
    // Limpiar la base de datos después de todos los tests
    await clearAllMongoDBData();
  });

  describe('Database Connection', () => {
    it('should connect to MongoDB successfully', async () => {
      const connection = await connectDB();
      expect(connection).toBeDefined();
      expect(connection.connection.readyState).toBe(1); // 1 = connected
    });
  });

  describe('Migration Service', () => {
    beforeEach(async () => {
      await clearAllMongoDBData();
    });

    it('should check migration status correctly', async () => {
      const status = await checkMigrationStatus();
      
      expect(status).toBeDefined();
      expect(status.usersCount).toBe(0);
      expect(status.copysCount).toBe(0);
      expect(status.isComplete).toBe(false);
      expect(typeof status.usersCount).toBe('number');
      expect(typeof status.copysCount).toBe('number');
      expect(typeof status.isComplete).toBe('boolean');
    });

    it('should debug migration data structure', async () => {
      // Verificar la estructura de los datos semilla
      console.log('Primer copy de seedCopys:', {
        hasComments: 'comments' in seedCopys[0],
        hasHistory: 'history' in seedCopys[0],
        keys: Object.keys(seedCopys[0])
      });
      
      // Verificar que podemos crear un copy simple sin comentarios
      const simpleCopy = new Copy({
        slug: 'test-slug',
        text: 'Test text',
        language: 'es',
        status: 'not_assigned'
      });
      
      await simpleCopy.save();
      expect(simpleCopy._id).toBeDefined();
      
      // Limpiar
      await Copy.deleteOne({ _id: simpleCopy._id });
    });

    it('should migrate seed data successfully', async () => {
      // Verificar que la BD está vacía
      const initialStatus = await checkMigrationStatus();
      expect(initialStatus.usersCount).toBe(0);
      expect(initialStatus.copysCount).toBe(0);
      expect(initialStatus.isComplete).toBe(false);

      // Ejecutar migración
      await migrateAllSeedDataToMongoDB();

      // Verificar que los datos se migraron
      const finalStatus = await checkMigrationStatus();
      expect(finalStatus.usersCount).toBeGreaterThan(0);
      expect(finalStatus.copysCount).toBeGreaterThan(0);
      expect(finalStatus.isComplete).toBe(true);
    });

    it('should not duplicate data on multiple migrations', async () => {
      // Primera migración
      await migrateAllSeedDataToMongoDB();
      const firstStatus = await checkMigrationStatus();

      // Segunda migración (debería saltar porque ya hay datos)
      await migrateAllSeedDataToMongoDB();
      const secondStatus = await checkMigrationStatus();

      // Los números deberían ser iguales
      expect(secondStatus.usersCount).toBe(firstStatus.usersCount);
      expect(secondStatus.copysCount).toBe(firstStatus.copysCount);
    });
  });

  describe('User Model', () => {
    it('should create a user successfully', async () => {
      await connectDB();
      
      const userData = {
        username: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'translator',
        languages: ['es', 'en']
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.languages).toEqual(userData.languages);
    });

    it('should enforce email uniqueness', async () => {
      await connectDB();
      
      const userData = {
        username: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'translator'
      };

      // Crear primer usuario
      const user1 = new User(userData);
      await user1.save();

      // Intentar crear segundo usuario con mismo email
      const user2 = new User({ ...userData, username: 'Different User' });
      
      await expect(user2.save()).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      await connectDB();
      
      const invalidUser = new User({
        username: 'Test User'
        // Faltan email, password y role
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });
  });

  describe('Copy Model', () => {
    it('should create a copy successfully', async () => {
      await connectDB();
      
      const copyData = {
        slug: 'test.slug',
        text: 'Test text',
        language: 'es',
        status: 'not_assigned'
      };

      const copy = new Copy(copyData);
      const savedCopy = await copy.save();

      expect(savedCopy._id).toBeDefined();
      expect(savedCopy.slug).toBe(copyData.slug);
      expect(savedCopy.text).toBe(copyData.text);
      expect(savedCopy.language).toBe(copyData.language);
      expect(savedCopy.status).toBe(copyData.status);
    });

    it('should enforce slug+language uniqueness', async () => {
      await connectDB();
      
      const copyData = {
        slug: 'duplicate.slug',
        text: 'Test text',
        language: 'es',
        status: 'not_assigned'
      };

      // Crear primer copy
      const copy1 = new Copy(copyData);
      await copy1.save();

      // Intentar crear segundo copy con mismo slug+idioma
      const copy2 = new Copy({ ...copyData, text: 'Different text' });
      
      await expect(copy2.save()).rejects.toThrow();
    });

    it('should allow same slug in different languages', async () => {
      await connectDB();
      
      const baseData = {
        slug: 'same.slug',
        text: 'Test text',
        status: 'not_assigned'
      };

      // Crear copys con mismo slug pero diferentes idiomas
      const copyES = new Copy({ ...baseData, language: 'es' });
      const copyEN = new Copy({ ...baseData, language: 'en' });

      const savedCopyES = await copyES.save();
      const savedCopyEN = await copyEN.save();

      expect(savedCopyES._id).toBeDefined();
      expect(savedCopyEN._id).toBeDefined();
      expect(savedCopyES.slug).toBe(savedCopyEN.slug);
      expect(savedCopyES.language).not.toBe(savedCopyEN.language);
    });

    it('should validate required fields', async () => {
      await connectDB();
      
      const invalidCopy = new Copy({
        slug: 'test.slug'
        // Faltan text y language
      });

      await expect(invalidCopy.save()).rejects.toThrow();
    });
  });
});
