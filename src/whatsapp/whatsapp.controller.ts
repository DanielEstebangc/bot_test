import { Controller, Get, Post, Body, Query, HttpStatus, Logger, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenaiService } from '../openai/openai.service';
import { ChatService } from '../chat/chat.service';
// Se cambia a import type o se importa el namespace completo para evitar el error de isolatedModules
import type { Response } from 'express'; 
import axios from 'axios';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly openaiService: OpenaiService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const verifyToken = this.configService.get<string>('WA_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return 'Forbidden';
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      // 1. RESPUESTA INMEDIATA A META (Evita repeticiones)
      res.status(HttpStatus.OK).send('EVENT_RECEIVED');

      // 2. PROCESAMIENTO EN SEGUNDO PLANO
      if (message?.type === 'text') {
        const userPhone = message.from;
        const userText = message.text.body;

        this.logger.log(`📩 Mensaje recibido de ${userPhone}: "${userText}"`);

        // Llamamos al flujo sin 'await' para que no bloquee la respuesta 200 OK
        this.processAiFlow(userPhone, userText).catch(err => 
          this.logger.error(`❌ Error fatal en processAiFlow: ${err.message}`)
        );
      }
    } catch (error) {
      this.logger.error('❌ Error procesando el webhook', error.stack);
    }
  }

  private async processAiFlow(userPhone: string, userText: string) {
    try {
      // Procesamiento con IA
      const aiResponse = await this.openaiService.chatConIA(userText);
      this.logger.log(`🤖 IA Responde a ${userPhone}: "${aiResponse}"`);

      // Persistencia secuencial (Evita el DeprecationWarning de PG)
      try {
        await this.chatService.saveMessage(userPhone, userText, 'user');
        this.logger.log(`💾 Historial guardado (User)`);
        
        await this.chatService.saveMessage(userPhone, aiResponse, 'assistant');
        this.logger.log(`💾 Historial guardado (AI)`);
      } catch (dbError) {
        this.logger.error(`Error DB: ${dbError.message}`);
      }

      // Envío a WhatsApp
      await this.sendWhatsAppMessage(userPhone, aiResponse);
      
    } catch (error) {
      this.logger.error(`❌ Error en el flujo de IA: ${error.message}`);
    }
  }

  private async sendWhatsAppMessage(to: string, text: string) {
    const phoneNumberId = this.configService.get<string>('WA_PHONE_NUMBER_ID');
    const accessToken = this.configService.get<string>('WA_ACCESS_TOKEN');
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    
    try {
      await axios.post(url, 
        { 
          messaging_product: 'whatsapp', 
          to: to, 
          type: 'text', 
          text: { body: text } 
        },
        { 
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      this.logger.warn(`⚠️ Mensaje no enviado a Meta: ${errorMsg}`);
    }
  }
}