import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('chats') // Esto le dice a TypeORM: "Crea una tabla con esta clase"
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  wa_id: string;

  @Column({ type: 'text' })
  message: string;

  @Column()
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
