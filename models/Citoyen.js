// models/Citoyen.js
const { db } = require('../firebase-config');

class Citoyen {
  constructor(data) {
    this.id = data.id || null;
    this.nom = data.nom || '';
    this.prenom = data.prenom || '';
    this.pere = data.pere || '';
    this.mere = data.mere || '';
    this.nci = data.nci || '';
    this.photo = data.photo || '';
    this.dateCreation = data.dateCreation || new Date();
    this.dateModification = data.dateModification || new Date();
  }

  // Validation des données
  validate() {
    const errors = [];
    
    if (!this.nom || this.nom.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    if (!this.prenom || this.prenom.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }
    
    if (!this.nci || !this.isValidNCI(this.nci)) {
      errors.push('Le NCI doit être valide (format attendu)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validation du format NCI (à adapter selon vos critères)
  isValidNCI(nci) {
    // Exemple: NCI de 13 chiffres
    const nciRegex = /^\d{13}$/;
    return nciRegex.test(nci);
  }

  // Convertir en objet pour Firestore
  toFirestore() {
    return {
      nom: this.nom.trim(),
      prenom: this.prenom.trim(),
      pere: this.pere.trim(),
      mere: this.mere.trim(),
      nci: this.nci.trim(),
      photo: this.photo,
      dateCreation: this.dateCreation,
      dateModification: new Date()
    };
  }

  // Créer depuis un document Firestore
  static fromFirestore(doc) {
    const data = doc.data();
    return new Citoyen({
      id: doc.id,
      ...data
    });
  }

  // Sauvegarder un nouveau citoyen
  async save() {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
    }

    // Vérifier l'unicité du NCI
    const existingCitoyen = await Citoyen.findByNCI(this.nci);
    if (existingCitoyen) {
      throw new Error('Un citoyen avec ce NCI existe déjà');
    }

    const docRef = await db.collection('citoyens').add(this.toFirestore());
    this.id = docRef.id;
    return this;
  }

  // Mettre à jour un citoyen existant
  async update() {
    if (!this.id) {
      throw new Error('ID requis pour la mise à jour');
    }

    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
    }

    await db.collection('citoyens').doc(this.id).update(this.toFirestore());
    return this;
  }

  // Trouver un citoyen par NCI
  static async findByNCI(nci) {
    try {
      const snapshot = await db.collection('citoyens')
        .where('nci', '==', nci.trim())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return Citoyen.fromFirestore(doc);
    } catch (error) {
      console.error('Erreur lors de la recherche par NCI:', error);
      throw new Error('Erreur lors de la recherche');
    }
  }

  // Trouver un citoyen par ID
  static async findById(id) {
    try {
      const doc = await db.collection('citoyens').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return Citoyen.fromFirestore(doc);
    } catch (error) {
      console.error('Erreur lors de la recherche par ID:', error);
      throw new Error('Erreur lors de la recherche');
    }
  }

  // Lister tous les citoyens avec pagination
  static async findAll(limit = 50, offset = 0) {
    try {
      const snapshot = await db.collection('citoyens')
        .orderBy('dateCreation', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const citoyens = [];
      snapshot.forEach(doc => {
        citoyens.push(Citoyen.fromFirestore(doc));
      });

      return citoyens;
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      throw new Error('Erreur lors de la récupération');
    }
  }

  // Supprimer un citoyen
  static async deleteById(id) {
    try {
      await db.collection('citoyens').doc(id).delete();
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw new Error('Erreur lors de la suppression');
    }
  }
}

module.exports = Citoyen;