export class Citoyen {
  nci: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: 'M' | 'F';
  adresse: string;
  photoPiece: string; // URL de la photo de la pièce d'identité
  typeDocument: 'CNI' | 'PASSPORT' | 'PERMIS';
  dateExpiration: string;
  actif: boolean;
  dateCreation: Date;
  dateModification: Date;

  constructor(partial: Partial<Citoyen>) {
    Object.assign(this, partial);
  }
}