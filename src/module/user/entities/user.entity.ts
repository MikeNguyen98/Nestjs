import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity() // db table
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number; // '!' mean can not null

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  password!: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastchanged: Date;
}
