import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async saveMessage(wa_id: string, message: string, role: 'user' | 'assistant') {
    const newChat = this.chatRepository.create({ wa_id, message, role });
    return await this.chatRepository.save(newChat);
  }

  // Extra: Esto sirve para darle contexto a la IA luego
  async getChatHistory(wa_id: string) {
    return await this.chatRepository.find({
      where: { wa_id },
      order: { createdAt: 'ASC' },
      take: 10, // Últimos 10 mensajes
    });
  }
}