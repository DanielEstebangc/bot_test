import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller'; // Asegúrate de que la ruta sea correcta
import { OpenaiModule } from '../openai/openai.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from '../chat/chat.module'; // <--- Importa el módulo de chat

@Module({
  imports: [
    OpenaiModule, // Para que pueda usar el servicio de IA
    ConfigModule,
    ChatModule 
  ],
  controllers: [WhatsappController], // <--- ¡ESTO ES LO QUE TE FALTABA!
  providers: [], 
})
export class WhatsappModule {}