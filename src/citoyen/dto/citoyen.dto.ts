import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class GetCitoyenDto {
  @IsNotEmpty({ message: 'Le NCI est requis' })
  @IsString()
  @Length(13, 13, { message: 'Le NCI doit contenir exactement 13 chiffres' })
  @Matches(/^[0-9]{13}$/, { message: 'Le NCI doit contenir uniquement des chiffres' })
  nci: string;
}

export class CitoyenResponseDto {
  success: boolean;
  data?: {
    nci: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance: string;
    sexe: string;
    adresse: string;
    photoPiece: string;
    typeDocument: string;
    dateExpiration: string;
    actif: boolean;
  };
  error?: string;
  message?: string;
}