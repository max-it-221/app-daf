// src/scripts/seed-citoyens.ts
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialisation Firebase
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();

// Données de test
const citoyensData = [
  {
    nci: '1234567890123',
    nom: 'Diop',
    prenom: 'Amadou',
    dateNaissance: '1990-05-15',
    lieuNaissance: 'Dakar',
    sexe: 'M',
    adresse: '25 Rue de la République, Dakar',
    photoPiece: 'https://example.com/pieces/1234567890123.jpg',
    typeDocument: 'CNI',
    dateExpiration: '2030-05-15',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '2345678901234',
    nom: 'Ndiaye',
    prenom: 'Fatou',
    dateNaissance: '1985-08-22',
    lieuNaissance: 'Thiès',
    sexe: 'F',
    adresse: '12 Avenue Blaise Diagne, Thiès',
    photoPiece: 'https://example.com/pieces/2345678901234.jpg',
    typeDocument: 'CNI',
    dateExpiration: '2029-08-22',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '3456789012345',
    nom: 'Sow',
    prenom: 'Moussa',
    dateNaissance: '1992-11-10',
    lieuNaissance: 'Saint-Louis',
    sexe: 'M',
    adresse: '8 Rue de France, Saint-Louis',
    photoPiece: 'https://example.com/pieces/3456789012345.jpg',
    typeDocument: 'PASSPORT',
    dateExpiration: '2027-11-10',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '4567890123456',
    nom: 'Fall',
    prenom: 'Aissatou',
    dateNaissance: '1988-03-18',
    lieuNaissance: 'Kaolack',
    sexe: 'F',
    adresse: '45 Boulevard du Sud, Kaolack',
    photoPiece: 'https://example.com/pieces/4567890123456.jpg',
    typeDocument: 'CNI',
    dateExpiration: '2028-03-18',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '5678901234567',
    nom: 'Ba',
    prenom: 'Ousmane',
    dateNaissance: '1995-07-25',
    lieuNaissance: 'Ziguinchor',
    sexe: 'M',
    adresse: '30 Rue Leclerc, Ziguinchor',
    photoPiece: 'https://example.com/pieces/5678901234567.jpg',
    typeDocument: 'CNI',
    dateExpiration: '2031-07-25',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '6789012345678',
    nom: 'Sarr',
    prenom: 'Mame Diarra',
    dateNaissance: '1991-12-05',
    lieuNaissance: 'Louga',
    sexe: 'F',
    adresse: '18 Avenue Malick Sy, Louga',
    photoPiece: 'https://example.com/pieces/6789012345678.jpg',
    typeDocument: 'CNI',
    dateExpiration: '2029-12-05',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '7890123456789',
    nom: 'Thiam',
    prenom: 'Abdoulaye',
    dateNaissance: '1987-04-14',
    lieuNaissance: 'Mbour',
    sexe: 'M',
    adresse: '22 Rue de la Plage, Mbour',
    photoPiece: 'https://example.com/pieces/7890123456789.jpg',
    typeDocument: 'PASSPORT',
    dateExpiration: '2026-04-14',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '8901234567890',
    nom: 'Gueye',
    prenom: 'Khady',
    dateNaissance: '1993-09-30',
    lieuNaissance: 'Diourbel',
    sexe: 'F',
    adresse: '5 Boulevard Ahmadou Bamba, Diourbel',
    photoPiece: 'https://example.com/pieces/8901234567890.jpg',
    typeDocument: 'CNI',
    dateExpiration: '2030-09-30',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '9012345678901',
    nom: 'Cisse',
    prenom: 'Ibrahima',
    dateNaissance: '1989-02-20',
    lieuNaissance: 'Tambacounda',
    sexe: 'M',
    adresse: '14 Rue Nationale, Tambacounda',
    photoPiece: 'https://example.com/pieces/9012345678901.jpg',
    typeDocument: 'CNI',
    dateExpiration: '2028-02-20',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
  {
    nci: '0123456789012',
    nom: 'Diallo',
    prenom: 'Mariama',
    dateNaissance: '1994-06-12',
    lieuNaissance: 'Kolda',
    sexe: 'F',
    adresse: '7 Avenue de la Paix, Kolda',
    photoPiece: 'https://example.com/pieces/0123456789012.jpg',
    typeDocument: 'PASSPORT',
    dateExpiration: '2029-06-12',
    actif: true,
    dateCreation: new Date(),
    dateModification: new Date(),
  },
];

async function seedFirestore() {
  try {
    console.log('🔄 Début du peuplement de Firestore...\n');

    const batch = db.batch();

    // Suppression des anciennes données (optionnel)
    console.log('🗑️  Suppression des anciennes données...');
    const existingDocs = await db.collection('citoyens').get();
    existingDocs.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Ajout des nouveaux citoyens
    console.log('➕ Ajout des nouveaux citoyens...');
    citoyensData.forEach((citoyen) => {
      const docRef = db.collection('citoyens').doc(citoyen.nci);
      batch.set(docRef, citoyen);
    });

    await batch.commit();

    console.log(`✅ ${citoyensData.length} citoyens ajoutés avec succès\n`);

    // Affichage des citoyens
    console.log('📋 Liste des citoyens:');
    citoyensData.forEach((citoyen) => {
      console.log(
        `   - ${citoyen.nci} | ${citoyen.prenom} ${citoyen.nom} | ${citoyen.typeDocument}`,
      );
    });

    console.log('\n✨ Base de données Firebase peuplée avec succès!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedFirestore();