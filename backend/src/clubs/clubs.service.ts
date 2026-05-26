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
import { User } from '../users/users.entity';

import { CreateClubDto } from './dto/create-club.dto';

import { UpdateClubDto } from './dto/update-club.dto';

import { QueryClubDto } from './dto/query-club.dto';
import { ClubMessage } from './club-message.entity';


@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private clubRepo: Repository<Club>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(ClubMessage)
    private messageRepo: Repository<ClubMessage>,
  ) {}

  async create(
    data: CreateClubDto,
    userId: number,
  ) {
    const club = this.clubRepo.create({
      ...data,

      creator: {
        id: userId,
      } as any,
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
          'creator.profile',
          'members',
          'members.profile',
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
          'creator.profile',
          'members',
          'members.profile',
        ],
      });

    if (!club) {
      throw new NotFoundException(
        'Club not found',
      );
    }

    return club;
  }

  async update(
    id: number,
    data: UpdateClubDto,
  ) {
    const club = await this.findOne(id);

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
        'creator.profile',
      ],
    });
  }

  async clubMembers(id: number) {
    const club = await this.clubRepo.findOne({
      where: { id },
      relations: [
        'members',
        'members.profile',
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
      relations: ['author', 'author.profile'],
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
        'creator.profile',
        'members',
        'members.profile',
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