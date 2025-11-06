// src/citoyen/citoyen.service.ts
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../config/firebase.config';
import { Citoyen } from './entities/citoyen.entity';
import { RequestLog } from './entities/request-log.entity';
import { CitoyenResponseDto} from './dto/citoyen.dto';
import { CreateRequestLogDto, QueryLogsDto } from './dto/request-log.dto';

@Injectable()
export class CitoyenService {
  private readonly citoyensCollection = 'citoyens';
  private readonly logsCollection = 'request_logs';

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Récupère un citoyen à partir de son NCI
   */
  async getCitoyenByNci(
    nci: string,
    comptePrincipal?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<CitoyenResponseDto> {
    const db = this.firebaseService.getFirestore();

    try {
      // Recherche du citoyen dans Firestore
      const snapshot = await db.collection(this.citoyensCollection).doc(nci).get();

      // Citoyen n'existe pas
      if (!snapshot.exists) {
        await this.logRequest({
          nci,
          operation: 'GET_CITOYEN',
          statut: 'NOT_FOUND',
          message: 'Citoyen non trouvé',
          comptePrincipal,
          ipAddress,
          userAgent,
        });

        return {
          success: false,
          error: 'CITOYEN_NOT_FOUND',
          message: 'Aucun citoyen trouvé avec ce NCI',
        };
      }

      const citoyenData = snapshot.data() as Citoyen;

      // Journalisation succès
      await this.logRequest({
        nci,
        operation: 'GET_CITOYEN',
        statut: 'SUCCESS',
        message: 'Citoyen récupéré avec succès',
        comptePrincipal,
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        data: {
          nci: citoyenData.nci,
          nom: citoyenData.nom,
          prenom: citoyenData.prenom,
          dateNaissance: citoyenData.dateNaissance,
          lieuNaissance: citoyenData.lieuNaissance,
          sexe: citoyenData.sexe,
          adresse: citoyenData.adresse,
          photoPiece: citoyenData.photoPiece,
          typeDocument: citoyenData.typeDocument,
          dateExpiration: citoyenData.dateExpiration,
          actif: citoyenData.actif,
        },
      };
    } catch (error) {
      // Erreur technique
      await this.logRequest({
        nci,
        operation: 'GET_CITOYEN',
        statut: 'ERROR',
        message: `Erreur technique: ${error.message}`,
        comptePrincipal,
        ipAddress,
        userAgent,
      });

      throw error;
    }
  }

  /**
   * Recherche des citoyens (pour admin)
   */
  async searchCitoyens(filters: any = {}, page = 1, limit = 10) {
    const db = this.firebaseService.getFirestore();
    let query = db.collection(this.citoyensCollection) as any;

    // Application des filtres
    if (filters.nom) {
      query = query.where('nom', '>=', filters.nom).where('nom', '<=', filters.nom + '\uf8ff');
    }
    if (filters.actif !== undefined) {
      query = query.where('actif', '==', filters.actif);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.orderBy('dateCreation', 'desc').offset(offset).limit(limit);

    const snapshot = await query.get();
    const citoyens = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Compte total (approximatif pour Firestore)
    const totalSnapshot = await db.collection(this.citoyensCollection).get();
    const total = totalSnapshot.size;

    return {
      success: true,
      data: citoyens,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère les logs de demandes pour un compte principal
   */
  async getRequestLogsByCompte(comptePrincipal: string, page = 1, limit = 20) {
    const db = this.firebaseService.getFirestore();
    const offset = (page - 1) * limit;

    const snapshot = await db
      .collection(this.logsCollection)
      .where('comptePrincipal', '==', comptePrincipal)
      .orderBy('dateRequete', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Compte total
    const totalSnapshot = await db
      .collection(this.logsCollection)
      .where('comptePrincipal', '==', comptePrincipal)
      .get();

    return {
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total: totalSnapshot.size,
        pages: Math.ceil(totalSnapshot.size / limit),
      },
    };
  }

  /**
   * Récupère tous les logs avec filtres
   */
  async getAllRequestLogs(filters: QueryLogsDto) {
    const db = this.firebaseService.getFirestore();
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let query = db.collection(this.logsCollection) as any;

    // Application des filtres
    if (filters.nci) {
      query = query.where('nci', '==', filters.nci);
    }
    if (filters.statut) {
      query = query.where('statut', '==', filters.statut);
    }
    if (filters.comptePrincipal) {
      query = query.where('comptePrincipal', '==', filters.comptePrincipal);
    }

    query = query.orderBy('dateRequete', 'desc').offset(offset).limit(limit);

    const snapshot = await query.get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Compte total
    const totalSnapshot = await db.collection(this.logsCollection).get();

    return {
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total: totalSnapshot.size,
        pages: Math.ceil(totalSnapshot.size / limit),
      },
    };
  }

  /**
   * Journalise une demande
   */
  private async logRequest(logData: CreateRequestLogDto): Promise<void> {
    try {
      const db = this.firebaseService.getFirestore();
      const log = new RequestLog({
        ...logData,
        dateRequete: new Date(),
      });

      await db.collection(this.logsCollection).add({
        ...log,
        dateRequete: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erreur lors de la journalisation:', error);
    }
  }
}