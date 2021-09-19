import { Student } from './entities/student.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('create')
  async create(@Body() createStudentDto: Student): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }
  @Get()
  index(): Promise<Student[]> {
    return this.studentsService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.studentsService.findOne(+id);
  // }

  @Patch(':id/update')
  update(@Param('id') id: number, @Body() updateStudentDto: Student) {
    updateStudentDto.studentid = Number(id);
    return this.studentsService.update(updateStudentDto);
  }

  @Delete(':id/delete')
  async delete(@Param('id') id: number): Promise<any> {
    return this.studentsService.delete(id);
  }
}
