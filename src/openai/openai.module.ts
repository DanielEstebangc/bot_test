import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ToolsModule } from '../tools/tools.module'; // Importamos las herramientas de scraping

@Module({
  imports: [ToolsModule], // 1. Traemos el módulo de scraping para que OpenAI lo use
  providers: [OpenaiService], // 2. Registramos el servicio de OpenAI
  exports: [OpenaiService], // 3. ¡IMPORTANTE! Lo exportamos para que el AppController lo vea
})
export class OpenaiModule {}