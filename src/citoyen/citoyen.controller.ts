// src/citoyen/citoyen.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  Ip,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CitoyenService } from './citoyen.service';
import { QueryLogsDto } from './dto/request-log.dto';

@Controller('api')
export class CitoyenController {
  constructor(private readonly citoyenService: CitoyenService) {}

  /**
   * GET /api/health
   * Health check
   */
  @Get('health')
  healthCheck() {
    return {
      success: true,
      service: 'AppDAF',
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/citoyens/:nci
   * Récupère un citoyen par son NCI
   */
  @Get('citoyens/:nci')
  async getCitoyen(
    @Param('nci') nci: string,
    @Query('comptePrincipal') comptePrincipal?: string,
    @Headers('x-compte-principal') xComptePrincipal?: string,
    @Headers('user-agent') userAgent?: string,
    @Ip() ip?: string,
  ) {
    // Validation du format NCI
    if (!/^[0-9]{13}$/.test(nci)) {
      throw new HttpException(
        {
          success: false,
          error: 'INVALID_NCI_FORMAT',
          message: 'Le NCI doit contenir exactement 13 chiffres',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const compte = comptePrincipal || xComptePrincipal;
    const result = await this.citoyenService.getCitoyenByNci(nci, compte, ip, userAgent);

    if (!result.success) {
      throw new HttpException(result, HttpStatus.NOT_FOUND);
    }

    return result;
  }

  /**
   * GET /api/citoyens
   * Recherche des citoyens (pour admin)
   */
  @Get('citoyens')
  async searchCitoyens(
    @Query('nom') nom?: string,
    @Query('actif') actif?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const filters: any = {};
    if (nom) filters.nom = nom;
    if (actif !== undefined) filters.actif = actif === 'true';

    return this.citoyenService.searchCitoyens(filters, Number(page), Number(limit));
  }

  /**
   * GET /api/logs/compte/:comptePrincipal
   * Récupère les logs d'un compte principal
   */
  @Get('logs/compte/:comptePrincipal')
  async getLogsByCompte(
    @Param('comptePrincipal') comptePrincipal: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.citoyenService.getRequestLogsByCompte(
      comptePrincipal,
      Number(page),
      Number(limit),
    );
  }

  /**
   * GET /api/logs
   * Récupère tous les logs avec filtres
   */
  @Get('logs')
  async getAllLogs(@Query() query: QueryLogsDto) {
    return this.citoyenService.getAllRequestLogs(query);
  }
}