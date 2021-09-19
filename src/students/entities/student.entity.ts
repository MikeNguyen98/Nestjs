import { Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Student extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  studentid!: number;

  @Field()
  name: string;

  @Field()
  age: number;

  @Field()
  year: string;
}
