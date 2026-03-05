import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service'; // Asegúrate de que la ruta sea correcta

@Module({
  providers: [ToolsService], // Registra el servicio aquí
  exports: [ToolsService],   // ¡CLAVE! Permite que OpenaiModule lo use
})
export class ToolsModule {}