import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity'; // Importa la entidad

@Module({
  imports: [
    // Esto es lo que crea la tabla en la DB
    TypeOrmModule.forFeature([Chat]) 
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}