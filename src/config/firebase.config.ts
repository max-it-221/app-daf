// src/config/firebase.config.ts
import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
       // Option 1: Chemin depuis la racine du projet
      const serviceAccountPath = path.join(
        process.cwd(),
        'config',
        'firebase',
        'serviceAccountKey.json'
      );
      
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.db = admin.firestore();
      console.log('✅ Firebase initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation Firebase:', error.message);
      throw error;
    }
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }

  getAuth(): admin.auth.Auth {
    return admin.auth();
  }

  getStorage(): admin.storage.Storage {
    return admin.storage();
  }
}