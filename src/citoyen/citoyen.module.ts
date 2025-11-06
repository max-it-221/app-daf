// src/citoyen/citoyen.module.ts
import { Module } from '@nestjs/common';
import { CitoyenController } from './citoyen.controller';
import { CitoyenService } from './citoyen.service';
import { FirebaseService } from '../config/firebase.config';

@Module({
  controllers: [CitoyenController],
  providers: [CitoyenService, FirebaseService],
  exports: [CitoyenService],
})
export class CitoyenModule {}

