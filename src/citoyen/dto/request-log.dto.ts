export class CreateRequestLogDto {
  nci: string;
  operation: 'GET_CITOYEN' | 'VERIFY_NCI';
  statut: 'SUCCESS' | 'ERROR' | 'NOT_FOUND';
  message: string;
  comptePrincipal?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class QueryLogsDto {
  nci?: string;
  statut?: 'SUCCESS' | 'ERROR' | 'NOT_FOUND';
  comptePrincipal?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}