import {
  Injectable, NotFoundException,
  BadRequestException, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentGroup } from './student-group.entity';
import { User } from '../users/users.entity';
import { Teacher } from '../teachers/teachers.entity';
import { GroupMessage } from './group-message.entity';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';

@Injectable()
export class StudentGroupsService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(StudentGroup)
    private groupRepo: Repository<StudentGroup>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(GroupMessage)
    private messageRepo: Repository<GroupMessage>,
  ) {}

  async create(data: CreateStudentGroupDto) {
    const existing = await this.groupRepo.findOne({ where: { name: data.name } });
    if (existing) throw new BadRequestException('Група з такою назвою вже існує');

    let curator: Teacher | null = null;
    if (data.curatorEmail) {
      const curatorUser = await this.userRepo.findOne({
        where: { email: data.curatorEmail },
        relations: ['teacherProfile'],
      });
      if (!curatorUser?.teacherProfile) throw new NotFoundException('Викладача не знайдено');
      curator = curatorUser.teacherProfile;
    }

    const group = this.groupRepo.create({
      name: data.name,
      year: data.year,
      specialty: data.specialty,
      curator,
    });

    return this.groupRepo.save(group);
  }

  async findAll() {
    const groups = await this.groupRepo.find({
      relations: [
        'curator',
        'curator.user',
        'curator.user.profile',
        'students',
        'students.profile',
      ],
      order: { name: 'ASC' },
    });

    return groups.map((group) => this.formatGroup(group));
  }

  async findOne(id: number) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: [
        'curator',
        'curator.user',
        'curator.user.profile',
        'students',
        'students.profile',
      ],
    });

    if (!group) throw new NotFoundException('Групу не знайдено');
    return this.formatGroup(group, true);   
  }

async getMyGroup(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['studentGroup'],
    });
    if (!user?.studentGroup) {
      throw new NotFoundException('Ви не входите до жодної групи');
    }
    const group = await this.groupRepo.findOne({
      where: { id: user.studentGroup.id },
      relations: [
        'curator',
        'curator.user',
        'students',
      ],
    });
    if (!group) throw new NotFoundException('Групу не знайдено');
    return this.formatGroup(group, true);
  }

  async update(id: number, data: UpdateStudentGroupDto) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['curator']
    });
    if (!group) throw new NotFoundException('Групу не знайдено');

    if (data.curatorEmail) {
      const curatorUser = await this.userRepo.findOne({
        where: { email: data.curatorEmail },
        relations: ['teacherProfile'],
      });
      if (!curatorUser?.teacherProfile) throw new NotFoundException('Викладача не знайдено');
      group.curator = curatorUser.teacherProfile;
    }

    if (data.name) group.name = data.name;
    if (data.year !== undefined) group.year = data.year;
    if (data.specialty !== undefined) group.specialty = data.specialty;

    return this.groupRepo.save(group);
  }

  async delete(id: number) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Групу не знайдено');
    await this.groupRepo.remove(group);
    return { message: 'Групу видалено' };
  }

  
  async addStudent(groupId: number, studentId: number) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Групу не знайдено');

    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Студента не знайдено');

    if (student.studentGroup?.id === groupId) {
      throw new BadRequestException('Студент вже в цій групі');
    }

    student.studentGroup = group;
    await this.userRepo.save(student);
    return { message: 'Студента додано' };
  }

  async removeStudent(groupId: number, studentId: number) {
    const student = await this.userRepo.findOne({
      where: { id: studentId },
      relations: ['studentGroup'],
    });
    if (!student) throw new NotFoundException('Студента не знайдено');

    if (student.studentGroup?.id !== groupId) {
      throw new BadRequestException('Студент не в цій групі');
    }

    student.studentGroup = null;
    await this.userRepo.save(student);
    return { message: 'Студента видалено з групи' };
  }

  async setCurator(groupId: number, teacherId: number) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    if (!group || !teacher) throw new NotFoundException('Групу або викладача не знайдено');
    group.curator = teacher;
    return this.groupRepo.save(group);
  }

  
  async hasAccessToGroup(groupId: number, userId: number): Promise<boolean> {
    
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['studentGroup'],
    });
    if (user?.studentGroup?.id === groupId) return true;

    
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['curator', 'curator.user'],
    });
    if (group?.curator?.user?.id === userId) return true;

    return false;
  }

  async isMember(groupId: number, userId: number): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['studentGroup'],
    });
    return user?.studentGroup?.id === groupId;
  }

  async sendGroupMessage(groupId: number, userId: number, content: string) {
    const hasAccess = await this.hasAccessToGroup(groupId, userId);
    if (!hasAccess) throw new UnauthorizedException('Немає доступу до чату');

    const message = this.messageRepo.create({
      content,
      group: { id: groupId } as any,
      author: { id: userId } as any,
    });
    return this.messageRepo.save(message);
  }

  async getGroupMessages(groupId: number, userId: number, limit = 50) {
    const hasAccess = await this.hasAccessToGroup(groupId, userId);
    if (!hasAccess) throw new UnauthorizedException('Немає доступу до чату');

    return this.messageRepo.find({
      where: { group: { id: groupId } },
      relations: ['author', 'author.profile'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private formatGroup(group: StudentGroup, withStudents = false) {
    const curator = group.curator ? {
      id: group.curator.id,
      firstName: group.curator.user?.firstName || '',
      lastName: group.curator.user?.lastName || '',
      fullName: [
        group.curator.user?.firstName,
        group.curator.user?.lastName,
      ].filter(Boolean).join(' ') || '—',
      email: group.curator.user?.email,
    } : null;

    const students = (group.students || []).map(student => ({
      id: student.id,
      email: student.email,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email,
      avatar: student.avatar || null,
    }));

    return {
      id: group.id,
      name: group.name,
      year: group.year,
      specialty: group.specialty,
      studentCount: students.length,
      curator,
      students: withStudents ? students : undefined,
    };
  }
}
