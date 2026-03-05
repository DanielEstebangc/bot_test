import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { OpenaiModule } from './openai/openai.module';
import { ToolsModule } from './tools/tools.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // 1. Cargar variables de entorno (fundamental para las API Keys)
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // 2. Configuración de Base de Datos PostgreSQL
    TypeOrmModule.forRoot({
    type: 'postgres',
    // Usamos || para dar un valor por defecto si la variable es undefined
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'), 
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password', // Pon aquí la clave que pusiste al instalar
    database: process.env.DB_NAME || 'pocki_db',
    autoLoadEntities: true,
    synchronize: true, 
  }),

    // 3. Tus módulos del negocio
    WhatsappModule, 
    OpenaiModule, 
    ToolsModule, 
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}