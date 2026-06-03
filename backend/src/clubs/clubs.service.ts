import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { Club } from './clubs.entity';
import { Role, User } from '../users/users.entity';

import { CreateClubDto } from './dto/create-club.dto';

import { UpdateClubDto } from './dto/update-club.dto';

import { QueryClubDto } from './dto/query-club.dto';
import { ClubMessage } from './club-message.entity';
import { SupabaseStorageService } from '../common/supabase-storage.service';


@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private clubRepo: Repository<Club>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(ClubMessage)
    private messageRepo: Repository<ClubMessage>,

    private storage: SupabaseStorageService,
  ) {}

  async create(data: CreateClubDto, userId: number, file?: Express.Multer.File) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'role', 'firstName', 'lastName']
    });

    if (!user) throw new NotFoundException('Користувача не знайдено');

    let leaderId: number | null = null;
    
    if (user.role === Role.TEACHER) {
      leaderId = userId;
    } else if (data.leaderId) {
      leaderId = data.leaderId;
    }

    let imageUrl = data.image;
    if (file) {
      imageUrl = await this.storage.upload(file, 'clubs');
    }

    const club = this.clubRepo.create({
      title: data.title,
      description: data.description,
      contact: data.contact,
      schedule: data.schedule,
      meetingTime: data.meetingTime,
      maxMembers: data.maxMembers || 20,
      image: imageUrl ?? null,
      creator: { id: userId },
      leader: leaderId ? { id: leaderId } : null,
    });

    return this.clubRepo.save(club);
  }

  async findAll(
    query: QueryClubDto,
  ) {
    const page = Number(query.page ?? 1);

    const limit = Number(
      query.limit ?? 10,
    );

    const where: FindOptionsWhere<Club>[] = [];

    if (query.search) {
      where.push(
        {
          title: ILike(
            `%${query.search}%`,
          ),
        },
        {
          description: ILike(
            `%${query.search}%`,
          ),
        },
      );
    }

    const [items, total] =
      await this.clubRepo.findAndCount({
        where:
          where.length > 0
            ? where
            : {},

        relations: [
          'creator',
          'members',
        ],

        order: {
          createdAt: 'DESC',
        },

        skip: (page - 1) * limit,

        take: limit,
      });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }

  async findOne(id: number) {
    const club =
      await this.clubRepo.findOne({
        where: { id },

        relations: [
          'creator',
          'members',
        ],
      });

    if (!club) {
      throw new NotFoundException(
        'Club not found',
      );
    }

    return club;
  }

  async update(id: number, data: UpdateClubDto, file?: Express.Multer.File) {
    const club = await this.findOne(id);

    if (file) {
      if (club.image) await this.storage.delete(club.image);
      data.image = await this.storage.upload(file, 'clubs');
    }

    Object.assign(club, data);
    return this.clubRepo.save(club);
  }

  async remove(id: number) {
    const club = await this.findOne(id);

    await this.clubRepo.remove(club);

    return {
      message: 'Club deleted',
    };
  }

  async joinClub(
    clubId: number,
    userId: number,
  ) {
    const club = await this.clubRepo.findOne({
      where: { id: clubId },
      relations: ['members'],
    });

    if (!club) {
      throw new NotFoundException(
        'Club not found',
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const alreadyJoined =
      club.members.some(
        (member) => member.id === userId,
      );

    if (alreadyJoined) {
      throw new BadRequestException(
        'You already joined this club',
      );
    }

    if (
      club.maxMembers > 0 &&
      club.members.length >= club.maxMembers
    ) {
      throw new BadRequestException(
        'Club is full',
      );
    }

    club.members.push(user);

    await this.clubRepo.save(club);

    return {
      message: 'Joined successfully',
    };
  }

  async leaveClub(
    clubId: number,
    userId: number,
  ) {
    const club = await this.clubRepo.findOne({
      where: { id: clubId },
      relations: ['members'],
    });

    if (!club) {
      throw new NotFoundException(
        'Club not found',
      );
    }

    club.members =
      club.members.filter(
        (member) => member.id !== userId,
      );

    await this.clubRepo.save(club);

    return {
      message: 'Left the club',
    };
  }

  async myClubs(userId: number) {
    return this.clubRepo.find({
      where: {
        members: {
          id: userId,
        },
      },
      relations: [
        'members',
        'creator',
      ],
    });
  }

  async clubMembers(id: number) {
    const club = await this.clubRepo.findOne({
      where: { id },
      relations: [
        'members',
      ],
    });

    if (!club) {
      throw new NotFoundException(
        'Club not found',
      );
    }

    return club.members;
  }

  async isMember(clubId: number, userId: number): Promise<boolean> {
    const club = await this.clubRepo.findOne({
      where: { id: clubId },
      relations: ['members'],
    });
    return club?.members?.some((m) => m.id === userId) ?? false;
  }

  async isClubLeader(clubId: number, userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    const club = await this.clubRepo.findOne({
      where: { id: clubId },
    });

    if (!club || !user) return false;

    return user.role === 'TEACHER';
  }

  async sendMessage(clubId: number, userId: number, content: string) {
    const isMember = await this.isMember(clubId, userId);
    const isLeader = await this.isClubLeader(clubId, userId);

    if (!isMember && !isLeader) {
      throw new UnauthorizedException('Немає доступу');
    }

    const message = this.messageRepo.create({
      content,
      club: { id: clubId } as any,
      author: { id: userId } as any,
    });

    return this.messageRepo.save(message);
  }

  async getMessages(clubId: number, userId: number, limit = 50) {
    const isMember = await this.isMember(clubId, userId);
    const isLeader = await this.isClubLeader(clubId, userId);

    if (!isMember && !isLeader) {
      throw new UnauthorizedException('Ви не є учасником цього гуртка');
    }

    return this.messageRepo.find({
      where: { club: { id: clubId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async myCreatedClubs(userId: number) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.clubRepo.find({
      where: {
        creator: { id: userId },
      },
      relations: [
        'creator',
        'members',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getParticipatedClubs(userId: number) {
    return this.clubRepo.find({
      where: [
        { members: { id: userId } },
        { creator: { id: userId } }
      ],
      relations: ['members', 'creator'],
      order: { createdAt: 'DESC' }
    });
  }
}