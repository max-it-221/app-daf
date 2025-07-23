// insertCitoyens.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase/serviceAccountKey.json');

// Initialiser Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Liste de citoyens à insérer
const citoyens = [
  {
    nom: "Diouf",
    prenom: "Mor",
    pere: "Alioune",
    mere: "Fatou",
    nci: "1234567890",
    photo: "https://via.placeholder.com/150"
  },
  {
    nom: "Sarr",
    prenom: "Aminata",
    pere: "Bocar",
    mere: "Awa",
    nci: "9876543210",
    photo: "https://via.placeholder.com/150"
  },
  {
    nom: "Ndoye",
    prenom: "Cheikh",
    pere: "Serigne",
    mere: "Khady",
    nci: "1122334455",
    photo: "https://via.placeholder.com/150"
  }
];

// Insérer chaque citoyen dans Firestore
const insererCitoyens = async () => {
  const collection = db.collection('citoyens');

  for (const citoyen of citoyens) {
    try {
      const docRef = await collection.add(citoyen);
      console.log(`✅ Citoyen ajouté avec ID: ${docRef.id}`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout:`, error);
    }
  }

  process.exit(); // Quitter le script
};

insererCitoyens();
