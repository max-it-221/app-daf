// 
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CitoyenModule } from './citoyen/citoyen.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CitoyenModule,
  ],
})
export class AppModule {}