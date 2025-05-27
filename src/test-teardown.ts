/**
 * Teardown global para tests de MongoDB
 * Se ejecuta al final de todos los tests
 */

import mongoose from 'mongoose';

export default async function teardown() {
  try {
    // Cerrar conexión a MongoDB si está abierta
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed after tests');
    }
  } catch (error) {
    console.error('Error during test teardown:', error);
  }
}
