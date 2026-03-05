import { Controller, Get, Query } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { ChatService } from './chat/chat.service';

@Controller('test-bot') // <--- Esta es la ruta base
export class AppController {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly chatService: ChatService,
  ) {}

  @Get() // <--- Este es el método GET
  async testMyBot(@Query('msg') msg: string) {
    const waId = '12345'; 

    try {
      // 1. Guardar mensaje del usuario
      await this.chatService.saveMessage(waId, msg, 'user');

      // 2. Obtener respuesta de la IA
      const respuestaIA = await this.openaiService.chatConIA(msg);

      // 3. Guardar respuesta de la IA
      await this.chatService.saveMessage(waId, respuestaIA || 'Sin respuesta', 'assistant');

      return {
        usuario: msg,
        bot: respuestaIA,
        status: 'Melo! Guardado en Postgres'
      };
    } catch (error) {
      return {
        status: 'Error en el flujo',
        error: error.message
      };
    }
  }
}