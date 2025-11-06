export class RequestLog {
  id?: string;
  nci: string;
  operation: 'GET_CITOYEN' | 'VERIFY_NCI';
  statut: 'SUCCESS' | 'ERROR' | 'NOT_FOUND';
  message: string;
  comptePrincipal?: string;
  ipAddress?: string;
  userAgent?: string;
  dateRequete: Date;

  constructor(partial: Partial<RequestLog>) {
    Object.assign(this, partial);
    this.dateRequete = this.dateRequete || new Date();
  }
}