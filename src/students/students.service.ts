import { Student } from './entities/student.entity';
import { Injectable } from '@nestjs/common';
import { UpdateResult, DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}
  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find();
  }

  async create(createStudentDto: Student): Promise<Student> {
    return await this.studentRepository.save(createStudentDto);
  }

  async update(updateStudentDto: Student): Promise<UpdateResult> {
    return await this.studentRepository.update(
      updateStudentDto.studentid,
      updateStudentDto,
    );
  }

  async delete(id): Promise<DeleteResult> {
    return await this.studentRepository.delete(id);
  }
}
