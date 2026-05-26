## backend/src\app.controller.ts
```ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

```

## backend/src\app.module.ts
```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { NewsModule } from './news/news.module';
import { MaterialsModule } from './materials/materials.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClubsModule } from './clubs/clubs.module';
import { FaqModule } from './faq/faq.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        ssl: {
          rejectUnauthorized: false,
        },

        entities: [__dirname + '/**/*.entity{.ts,.js}'],

        synchronize: true,
      }),
    }),

    AuthModule,
    UsersModule,
    ProfileModule,
    NewsModule,
    MaterialsModule,
    TeachersModule,
    ClubsModule,
    FaqModule,
    DocumentsModule,
  ],
})
export class AppModule {}
```

## backend/src\app.service.ts
```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

```

## backend/src\auth\auth.controller.ts
```ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }
}
```

## backend/src\auth\auth.module.ts
```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: '1d',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```

## backend/src\auth\auth.service.ts
```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: RegisterDto) {
    return this.usersService.create(data);
  }
}
```

## backend/src\auth\dto\login.dto.ts
```ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
```

## backend/src\auth\dto\register.dto.ts
```ts
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from 'src/users/users.entity';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role; 
}
```

## backend/src\auth\interfaces\jwt-payload.interface.ts
```ts
export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}
```

## backend/src\auth\jwt.strategy.ts
```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
    console.log('JWT_SECRET:', configService.get('JWT_SECRET'));
  }

async validate(payload: JwtPayload) {
  if (!payload.sub) {
    throw new UnauthorizedException('Invalid token');
  }
  return {
    sub: payload.sub,
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
}
```

## backend/src\auth\jwt-auth.guard.ts
```ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## backend/src\clubs\club-chat.gateway.ts
```ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import {
  Injectable,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { ClubsService } from './clubs.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ClubChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private clubsService: ClubsService,
    private jwtService: JwtService,
  ) {}

async handleConnection(client: Socket) {
  try {
    const token = client.handshake.auth.token;

    console.log('HANDSHAKE AUTH:', client.handshake.auth);
    console.log('TOKEN:', token);

    if (!token) {
      console.log('NO TOKEN');
      client.disconnect();
      return;
    }

    const payload = this.jwtService.verify(token);

    console.log('JWT OK:', payload);

    client.data.userId = payload.sub;
  } catch (e: any) {
    console.log('JWT FAILED:', e.message);

    client.disconnect();
  }
}

  handleDisconnect() {}

  @SubscribeMessage(
    'joinClubRoom',
  )
  async handleJoinRoom(
    @MessageBody() clubId: number,
    @ConnectedSocket()
    client: Socket,
  ) {
    const userId =
      client.data.userId;

    const isMember = await this.clubsService.isMember(clubId, userId);
    const isLeader = await this.clubsService.isClubLeader(clubId, userId);

    if (!isMember && !isLeader) {
      client.emit('chatError', 'РќРµРјР°С” РґРѕСЃС‚СѓРїСѓ РґРѕ С‡Р°С‚Сѓ');
      client.disconnect();
      return;
    }

    client.join(`club-${clubId}`);

    const messages =
      await this.clubsService.getMessages(
        clubId,
        userId,
      );

    client.emit(
      'messagesHistory',
      messages,
    );
  }

  @SubscribeMessage(
    'sendMessage',
  )
  async handleSendMessage(
    @MessageBody()
    body: {
      clubId: number;
      content: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    try {
      const userId =
        client.data.userId;

      const message =
        await this.clubsService.sendMessage(
          body.clubId,
          userId,
          body.content,
        );

      this.server
        .to(`club-${body.clubId}`)
        .emit(
          'newMessage',
          message,
        );
    } catch (err: any) {
      client.emit(
        'chatError',
        err.message,
      );
    }
  }
}
```

## backend/src\clubs\club-message.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Club } from './clubs.entity';
import { User } from '../users/users.entity';

@Entity()
export class ClubMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => Club, (club) => club.messages, { onDelete: 'CASCADE' })
  club!: Club;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
```

## backend/src\clubs\clubs.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { ClubsService } from './clubs.service';

import { CreateClubDto } from './dto/create-club.dto';

import { UpdateClubDto } from './dto/update-club.dto';

import { QueryClubDto } from './dto/query-club.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/guards/roles.decorator';

import { Role } from '../users/users.entity';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('clubs')
export class ClubsController {
  constructor(
    private clubsService: ClubsService,
  ) {}

  @Get()
  findAll(
    @Query() query: QueryClubDto,
  ) {
    return this.clubsService.findAll(
      query,
    );
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('participated')
  getParticipatedClubs(@CurrentUser() user: JwtPayload) {
    return this.clubsService.getParticipatedClubs(user.sub);
  }


  @UseGuards(JwtAuthGuard)
  @Get('my-created')
  myCreatedClubs(@CurrentUser() user: JwtPayload) {
    return this.clubsService.myCreatedClubs(user.sub);
  }


  @UseGuards(JwtAuthGuard)
  @Get('my')
  myClubs(@CurrentUser() user: JwtPayload) {
    return this.clubsService.myClubs(user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clubsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination:
          './uploads/clubs',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueName +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  create(
    @Body()
    body: CreateClubDto,

    @CurrentUser()
    user: JwtPayload,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.image =
        `/uploads/clubs/${file.filename}`;
    }

    return this.clubsService.create(
      body,
      user.sub,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination:
          './uploads/clubs',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueName +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    body: UpdateClubDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.image =
        `/uploads/clubs/${file.filename}`;
    }

    return this.clubsService.update(
      id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clubsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinClub(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.clubsService.joinClub(
      id,
      user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/leave')
  leaveClub(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.clubsService.leaveClub(
      id,
      user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  clubMembers(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clubsService.clubMembers(
      id,
    );
  }

@UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  getClubMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clubsService.getMessages(id, user.sub);
  }
}
```

## backend/src\clubs\clubs.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { User } from '../users/users.entity';
import { ClubMessage } from './club-message.entity';

@Entity()
export class Club {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  description!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  image?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  contact!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  leader?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  schedule?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  meetingTime?: string;

  @Column({
    type: 'int',
    default: 0,
  })
  maxMembers!: number;

  @ManyToMany(() => User)
  @JoinTable()
  members!: User[];

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  creator?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  get currentMembers(): number {
    return this.members?.length ?? 0;
  }

  @OneToMany(() => ClubMessage, (message) => message.club)
    messages!: ClubMessage[];
}
```

## backend/src\clubs\clubs.module.ts
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { Club } from './clubs.entity';
import { ClubMessage } from './club-message.entity';

import { User } from '../users/users.entity';

import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

import { ClubChatGateway } from './club-chat.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Club,
      User,
      ClubMessage,
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],

  controllers: [
    ClubsController,
  ],

  providers: [
    ClubsService,
    ClubChatGateway,
  ],
})
export class ClubsModule {}
```

## backend/src\clubs\clubs.service.ts
```ts
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
      throw new UnauthorizedException('РќРµРјР°С” РґРѕСЃС‚СѓРїСѓ');
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
      throw new UnauthorizedException('Р’Рё РЅРµ С” СѓС‡Р°СЃРЅРёРєРѕРј С†СЊРѕРіРѕ РіСѓСЂС‚РєР°');
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
```

## backend/src\clubs\dto\create-club.dto.ts
```ts
import {
  IsString,
  MinLength,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateClubDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  @MinLength(3)
  contact!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  leader?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsString()
  meetingTime?: string;

  @IsOptional()
  @IsInt()
  maxMembers?: number;
}
```

## backend/src\clubs\dto\query-club.dto.ts
```ts
import {
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

export class QueryClubDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
```

## backend/src\clubs\dto\update-club.dto.ts
```ts
import { PartialType } from '@nestjs/mapped-types';

import { CreateClubDto } from './create-club.dto';

export class UpdateClubDto extends PartialType(
  CreateClubDto,
) {}
```

## backend/src\common\decorators\current-user.decorator.ts
```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return {
      sub: user?.sub || user?.userId,
      userId: user?.userId || user?.sub,
      email: user?.email,
      role: user?.role,
    };
  },
);
```

## backend/src\common\guards\roles.decorator.ts
```ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/users.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

## backend/src\common\guards\roles.guard.ts
```ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '../../users/users.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}
```

## backend/src\documents\document.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/users.entity';
import { DocumentCategory } from './document-category.entity';

export enum DocumentType {
  TEMPLATE = 'template',
  SAMPLE = 'sample',
  FORM = 'form',
  REFERENCE = 'reference',
  OTHER = 'other',
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  type!: DocumentType;

  @ManyToOne(() => DocumentCategory, { eager: true, nullable: false })
  category!: DocumentCategory;

  @Column({ type: 'varchar', nullable: true })
  file!: string | null;

  @Column({ type: 'varchar', nullable: true })
  originalFileName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  mimeType?: string | null;

  @Column({ type: 'bigint', nullable: true })
  size?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  author?: User | null;

  @Column({ default: true })
  isPublished!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
```

## backend/src\documents\document-category.entity.ts
```ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Document } from './document.entity';

@Entity()
export class DocumentCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 100 })
  name!: string;

  @OneToMany(() => Document, (document) => document.category)
  documents!: Document[];
}
```

## backend/src\documents\documents.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { Role } from '../users/users.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  findAll(@Query() query: QueryDocumentDto, @CurrentUser() user?: JwtPayload) {
    return this.documentsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @Body() body: CreateDocumentDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentsService.create(body, user.sub, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.update(id, body, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.documentsService.remove(id, user);
  }
}
```

## backend/src\documents\documents.module.ts
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentCategory } from './document-category.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentCategoryController } from './documents-category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentCategory]),
  ],
  controllers: [DocumentCategoryController, DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
```

## backend/src\documents\documents.service.ts
```ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Document } from './document.entity';
import { DocumentCategory } from './document-category.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/users.entity';
import { CreateDocumentCategoryDto } from './dto/create-document-category.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(DocumentCategory)
    private categoryRepo: Repository<DocumentCategory>,
  ) {}

  async create(data: CreateDocumentDto, userId: number, file?: Express.Multer.File) {
    const category = await this.categoryRepo.findOne({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const document = this.documentRepo.create({
      title: data.title,
      description: data.description,
      type: data.type,
      isPublished: data.isPublished ?? true,
      
      category,

      author: { id: userId } as any,

      file: file ? `/uploads/documents/${file.filename}` : null,
      originalFileName: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size,
    });

    return this.documentRepo.save(document);
  }

  async findAll(query: QueryDocumentDto, user?: JwtPayload) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: FindOptionsWhere<Document> = {};

    if (!query.showUnpublished || user?.role !== Role.ADMIN) {
      where.isPublished = true;
    }

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.categoryId) {
      where.category = { id: Number(query.categoryId) };
    }

    const [items, total] = await this.documentRepo.findAndCount({
      where,
      relations: ['author', 'author.profile', 'category'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const doc = await this.documentRepo.findOne({
      where: { id },
      relations: ['author', 'author.profile', 'category'],
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: number, data: UpdateDocumentDto, user: JwtPayload) {
    const doc = await this.findOne(id);

    if (user.role === Role.TEACHER && doc.author?.id !== user.sub) {
      throw new ForbiddenException('You can only edit your own documents');
    }

    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      doc.category = category;
    }

    Object.assign(doc, data);
    return this.documentRepo.save(doc);
  }

  async remove(id: number, user: JwtPayload) {
    const doc = await this.findOne(id);

    if (user.role === Role.TEACHER && doc.author?.id !== user.sub) {
      throw new ForbiddenException('You can only delete your own documents');
    }

    await this.documentRepo.remove(doc);
    return { message: 'Document deleted' };
  }

  async findAllCategories() {
    return this.categoryRepo.find({
      order: { name: 'ASC' },
    });
  }

  async createCategory(data: CreateDocumentCategoryDto) {
    const existing = await this.categoryRepo.findOne({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  async removeCategory(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['documents'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.documents && category.documents.length > 0) {
      throw new BadRequestException('Cannot delete category that has documents');
    }

    await this.categoryRepo.remove(category);
    return { message: 'Category deleted successfully' };
  }
}
```

## backend/src\documents\documents-category.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentCategoryDto } from './dto/create-document-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { Role } from '../users/users.entity';

@Controller('documents/categories')
export class DocumentCategoryController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAllCategories();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateDocumentCategoryDto) {
    return this.documentsService.createCategory(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.removeCategory(id);
  }
}
```

## backend/src\documents\dto\create-document.dto.ts
```ts
import { Transform } from 'class-transformer';
import { IsString, MinLength, IsEnum, IsInt, IsOptional, IsBoolean } from 'class-validator';
import { DocumentType } from '../document.entity';

export class CreateDocumentDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(DocumentType)
  type!: DocumentType;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  categoryId!: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;
}
```

## backend/src\documents\dto\create-document-category.dto.ts
```ts
import { IsString, MinLength } from 'class-validator';

export class CreateDocumentCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;
}
```

## backend/src\documents\dto\query-document.dto.ts
```ts
import { IsOptional, IsString, IsNumberString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentType } from '../document.entity';

export class QueryDocumentDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  showUnpublished?: boolean;
}
```

## backend/src\documents\dto\update-document.dto.ts
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
```

## backend/src\faq\dto\create-faq.dto.ts
```ts

import { IsString, MinLength, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { FaqCategory } from '../faq.entity';

export class CreateFaqDto {
  @IsString()
  @MinLength(10)
  question!: string;

  @IsString()
  @MinLength(20)
  answer!: string;

  @IsEnum(FaqCategory)
  category!: FaqCategory;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
```

## backend/src\faq\dto\query-faq.dto.ts
```ts
import { IsOptional, IsString, IsEnum, IsNumberString, IsBoolean } from 'class-validator';
import { FaqCategory } from '../faq.entity';

export class QueryFaqDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(FaqCategory)
  category?: FaqCategory;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsBoolean()
  showUnpublished?: boolean;
}
```

## backend/src\faq\dto\update-faq.dto.ts
```ts
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { FaqCategory } from '../faq.entity';

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  category?: FaqCategory;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
```

## backend/src\faq\faq.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { QueryFaqDto } from './dto/query-faq.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { Role } from '../users/users.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { FaqCategory } from './faq.entity';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  findAll(@Query() query: QueryFaqDto) {
    return this.faqService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.findOne(id);
  }
  

  @UseGuards(JwtAuthGuard)
  @Post('ask')
  askQuestion(
    @Body() body: { question: string; category?: FaqCategory },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.faqService.askQuestion(body.question, body.category, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Post()
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    console.log('рџ”Ќ PATCH DTO:', updateFaqDto);
    console.log('рџ”Ќ DTO Keys:', Object.keys(updateFaqDto));
    
    return this.faqService.update(id, updateFaqDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.remove(id);
  }
}
```

## backend/src\faq\faq.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

export enum FaqCategory {
  ADMISSION = 'ADMISSION',
  DOCUMENTS = 'DOCUMENTS',
  STUDIES = 'STUDIES',
  SCHEDULE = 'SCHEDULE',
  CLUBS = 'CLUBS',
  TEACHERS = 'TEACHERS',
  OTHER = 'OTHER',
}

@Entity()
export class Faq {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  question!: string;

  @Column({ type: 'text' })
  answer!: string;

  @Column({
    type: 'enum',
    enum: FaqCategory,
    default: FaqCategory.OTHER,
  })
  category!: FaqCategory;

  @Column({ default: true })
  isPublished!: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  author?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

## backend/src\faq\faq.module.ts
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from './faq.entity';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
```

## backend/src\faq\faq.service.ts
```ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Faq } from './faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { QueryFaqDto } from './dto/query-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepo: Repository<Faq>,
  ) {}

  async findAll(query: QueryFaqDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: FindOptionsWhere<Faq> = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.question = ILike(`%${query.search}%`);
    }

    const [items, total] = await this.faqRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async create(data: CreateFaqDto) {
    const faq = this.faqRepo.create({ ...data, isPublished: true });
    return this.faqRepo.save(faq);
  }

  async update(id: number, data: UpdateFaqDto) {
    const faq = await this.findOne(id);
    Object.assign(faq, data);
    return this.faqRepo.save(faq);
  }

  async remove(id: number) {
    const faq = await this.findOne(id);
    await this.faqRepo.remove(faq);
    return { message: 'FAQ deleted' };
  }

  async askQuestion(question: string, category: any, userId: number) {
    const faq = this.faqRepo.create({
      question,
      answer: '', 
      category: category || 'OTHER',
      isPublished: false,
      author: { id: userId } as any,
    });

    return this.faqRepo.save(faq);
  }
}
```

## backend/src\main.ts
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}

bootstrap();
```

## backend/src\materials\categories\dto\create-material-category.dto.ts
```ts
import {
  IsString,
  MinLength,
} from 'class-validator';

export class CreateMaterialCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;
}
```

## backend/src\materials\categories\material-category.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';

import { MaterialCategoryService } from './material-category.service';

import { CreateMaterialCategoryDto } from './dto/create-material-category.dto';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/guards/roles.decorator';

import { Role } from '../../users/users.entity';

@Controller('material-categories')
export class MaterialCategoryController {
  constructor(
    private categoryService: MaterialCategoryService,
  ) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.categoryService.findOne(
      id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body()
    body: CreateMaterialCategoryDto,
  ) {
    return this.categoryService.create(
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.categoryService.remove(
      id,
    );
  }
}
```

## backend/src\materials\categories\material-category.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { Material } from '../material.entity';

@Entity()
export class MaterialCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @OneToMany(
    () => Material,
    (material) => material.category,
  )
  materials!: Material[];
}
```

## backend/src\materials\categories\material-category.module.ts
```ts
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { MaterialCategory } from './material-category.entity';

import { MaterialCategoryService } from './material-category.service';

import { MaterialCategoryController } from './material-category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialCategory,
    ]),
  ],

  providers: [
    MaterialCategoryService,
  ],

  controllers: [
    MaterialCategoryController,
  ],

  exports: [
    MaterialCategoryService,
  ],
})
export class MaterialCategoryModule {}
```

## backend/src\materials\categories\material-category.service.ts
```ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MaterialCategory } from './material-category.entity';

import { CreateMaterialCategoryDto } from './dto/create-material-category.dto';

@Injectable()
export class MaterialCategoryService {
  constructor(
    @InjectRepository(MaterialCategory)
    private categoryRepo: Repository<MaterialCategory>,
  ) {}

  async create(
    data: CreateMaterialCategoryDto,
  ) {
    const existing =
      await this.categoryRepo.findOne({
        where: {
          name: data.name,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Category already exists',
      );
    }

    const category =
      this.categoryRepo.create(data);

    return this.categoryRepo.save(
      category,
    );
  }

  findAll() {
    return this.categoryRepo.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const category =
      await this.categoryRepo.findOne({
        where: { id },

        relations: ['materials'],
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    return category;
  }

  async remove(id: number) {
    const category =
      await this.findOne(id);

    await this.categoryRepo.remove(
      category,
    );

    return {
      message: 'Category deleted',
    };
  }
}
```

## backend/src\materials\dto\create-material.dto.ts
```ts
import {
  IsString,
  MinLength,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';

import { MaterialType } from '../material.entity';

export class CreateMaterialDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsInt()
  categoryId!: number;
}
```

## backend/src\materials\dto\query-material.dto.ts
```ts
import {
  IsOptional,
  IsString,
  IsNumberString,
  IsEnum,
} from 'class-validator';

import { MaterialType } from '../material.entity';

export class QueryMaterialDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @IsOptional()
  @IsString()
  my?: string;
}
```

## backend/src\materials\dto\update-material.dto.ts
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDto } from './create-material.dto';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}
```

## backend/src\materials\material.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from '../users/users.entity';

import { MaterialCategory } from './categories/material-category.entity';

export enum MaterialType {
  LECTURE = 'lecture',
  PRESENTATION = 'presentation',
  METHODICAL = 'methodical',
  OTHER = 'other',
}

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.OTHER,
  })
  type!: MaterialType;

  @Column({
    type: 'text',
  })
  description!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  file?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  originalFileName?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  mimeType?: string | null;

  @Column({
    type: 'bigint',
    nullable: true,
  })
  size?: number | null;

  @ManyToOne(
    () => MaterialCategory,
    (category) => category.materials,
    {
      eager: true,
      nullable: false,
    },
  )
  category!: MaterialCategory;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  author?: User | null;

  @CreateDateColumn()
  createdAt!: Date;
}
```

## backend/src\materials\materials.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { MaterialsService } from './materials.service';

import { CreateMaterialDto } from './dto/create-material.dto';

import { UpdateMaterialDto } from './dto/update-material.dto';

import { QueryMaterialDto } from './dto/query-material.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/guards/roles.decorator';

import { Role } from '../users/users.entity';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('materials')
export class MaterialsController {
  constructor(
    private materialsService: MaterialsService,
  ) {}

  @Get()
  findAll(
    @Query() query: QueryMaterialDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.materialsService.findAll(
      query,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.materialsService.findOne(
      id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination:
          './uploads/materials',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueName +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  create(
    @Body()
    body: CreateMaterialDto,

    @CurrentUser()
    user: JwtPayload,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    return this.materialsService.create(
      body,
      user.sub,
      file,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/materials',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    })
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMaterialDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.materialsService.update(id, body, user, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.materialsService.remove(
      id,
      user,
    );
  }
}
```

## backend/src\materials\materials.module.ts
```ts
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Material } from './material.entity';

import { MaterialCategory } from './categories/material-category.entity';

import { MaterialsController } from './materials.controller';

import { MaterialsService } from './materials.service';

import { MaterialCategoryModule } from './categories/material-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Material,
      MaterialCategory,
    ]),

    MaterialCategoryModule,
  ],

  controllers: [MaterialsController],

  providers: [MaterialsService],
})
export class MaterialsModule {}
```

## backend/src\materials\materials.service.ts
```ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { Material, MaterialType } from './material.entity';

import { MaterialCategory } from './categories/material-category.entity';

import { CreateMaterialDto } from './dto/create-material.dto';

import { UpdateMaterialDto } from './dto/update-material.dto';

import { QueryMaterialDto } from './dto/query-material.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { Role } from 'src/users/users.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialRepo: Repository<Material>,

    @InjectRepository(MaterialCategory)
    private categoryRepo: Repository<MaterialCategory>,
  ) {}

  async create(
    data: CreateMaterialDto,
    userId: number,
    file?: Express.Multer.File,
  ) {
    const category =
      await this.categoryRepo.findOne({
        where: {
          id: data.categoryId,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Category not found',
      );
    }

    const material =
      this.materialRepo.create({
        title: data.title,
        description: data.description,

        category,
        type: data.type || MaterialType.OTHER,

        author: {
          id: userId,
        } as any,

        file: file
          ? `/uploads/materials/${file.filename}`
          : null,

        originalFileName:
          file?.originalname,

        mimeType: file?.mimetype,

        size: file?.size,
      });

    return this.materialRepo.save(material);
  }

  async findAll(
    query: QueryMaterialDto,
    currentUser?: JwtPayload,
  ) {
    const page = Number(query.page ?? 1);

    const limit = Number(
      query.limit ?? 10,
    );

    const where: FindOptionsWhere<Material> =
      {};

      if (query.my === 'true' && currentUser?.sub) {
        where.author = { id: currentUser.sub };
      }

      if (query.type) {
        where.type = query.type;
      }
    
      if (query.search) {
        where.title = ILike(
          `%${query.search}%`,
        );
      }

    if (query.categoryId) {
      where.category = {
        id: Number(query.categoryId),
      };
    }

    const [items, total] =
      await this.materialRepo.findAndCount({
        where,

        relations: [
          'author',
          'author.profile',
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
    const material =
      await this.materialRepo.findOne({
        where: { id },

        relations: [
          'author',
          'author.profile',
        ],
      });

    if (!material) {
      throw new NotFoundException(
        'Material not found',
      );
    }

    return material;
  }

  async update(
    id: number,
    data: UpdateMaterialDto,
    user: JwtPayload,
    file?: Express.Multer.File,
  ) {
    const material = await this.findOne(id);

    if (user.role === Role.TEACHER && material.author?.id !== user.sub) {
      throw new ForbiddenException('You can edit only your materials');
    }

    if (data.title) material.title = data.title;
    if (data.description) material.description = data.description;
    if (data.type) material.type = data.type;
    if (data.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: data.categoryId },
      });
      if (category) material.category = category;
    }

    if (file) {
      material.file = `/uploads/materials/${file.filename}`;
      material.originalFileName = file.originalname;
      material.mimeType = file.mimetype;
      material.size = file.size;
    }

    return this.materialRepo.save(material);
  }

  async remove(
    id: number,
    user: JwtPayload,
  ) {
    const material =
      await this.findOne(id);

      if (
        user.role === Role.TEACHER &&
        material.author?.id !== user.sub
      ) {
        throw new ForbiddenException(
          'You can delete only your materials',
        );
      }

      await this.materialRepo.remove(
        material,
      );

      return {
        message: 'Material deleted',
      };
  }
}
```

## backend/src\news\comments\dto\create-news-comment.dto.ts
```ts
import { IsString, MinLength } from 'class-validator';

export class CreateNewsCommentDto {
  @IsString()
  @MinLength(3)
  content!: string;
}
```

## backend/src\news\comments\news-comment.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { News } from '../news.entity';
import { User } from '../../users/users.entity';

@Entity()
export class NewsComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => News, (news) => news.comments, { onDelete: 'CASCADE' })
  news!: News;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: true })
  isPublished!: boolean;
}
```

## backend/src\news\comments\news-comments.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NewsCommentsService } from './news-comments.service';
import { CreateNewsCommentDto } from './dto/create-news-comment.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller('news/:newsId/comments')
export class NewsCommentsController {
  constructor(private newsCommentsService: NewsCommentsService) {}

  @Get()
  findAll(@Param('newsId', ParseIntPipe) newsId: number) {
    return this.newsCommentsService.findByNewsId(newsId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('newsId', ParseIntPipe) newsId: number,
    @Body() dto: CreateNewsCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.newsCommentsService.create(newsId, dto, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  remove(
    @Param('newsId', ParseIntPipe) newsId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.newsCommentsService.remove(newsId, commentId, user);
  }
}
```

## backend/src\news\comments\news-comments.service.ts
```ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsComment } from './news-comment.entity';
import { News } from '../news.entity';
import { User } from '../../users/users.entity';
import { CreateNewsCommentDto } from './dto/create-news-comment.dto';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { Role } from '../../users/users.entity';

@Injectable()
export class NewsCommentsService {
  constructor(
    @InjectRepository(NewsComment)
    private commentRepo: Repository<NewsComment>,
    @InjectRepository(News)
    private newsRepo: Repository<News>,
  ) {}

  async create(newsId: number, dto: CreateNewsCommentDto, userId: number) {
    const news = await this.newsRepo.findOne({ where: { id: newsId } });
    if (!news) throw new NotFoundException('News not found');

    const comment = this.commentRepo.create({
      content: dto.content,
      news: { id: newsId } as any,
      author: { id: userId } as any,
    });

    return this.commentRepo.save(comment);
  }

  async findByNewsId(newsId: number) {
    return this.commentRepo.find({
      where: { news: { id: newsId }, isPublished: true },
      relations: ['author', 'author.profile'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(newsId: number, commentId: number, user: JwtPayload) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['author', 'news'],
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.news.id !== newsId) throw new NotFoundException('Comment not found');


    if (user.role !== Role.ADMIN && comment.author.id !== user.sub) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted' };
  }
}
```

## backend/src\news\dto\create-news.dto.ts
```ts
import {
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';

import { NewsCategory } from '../news.entity';
import { Transform } from 'class-transformer';

export class CreateNewsDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
```

## backend/src\news\dto\query-news.dto.ts
```ts
import {
  IsOptional,
  IsString,
  IsNumberString,
  IsEnum,
} from 'class-validator';
import { NewsCategory } from '../news.entity';

export class QueryNewsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;
}
```

## backend/src\news\dto\update-news.dto.ts
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsDto } from './create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}
```

## backend/src\news\news.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { NewsService } from './news.service';

import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/guards/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/users.entity';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller('news')
export class NewsController {
  constructor(
    private newsService: NewsService,
  ) {}

  @Get()
  findAll(
    @Query() query: QueryNewsDto,
  ) {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.newsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/news',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9);

          callback(
            null,
            uniqueName +
              extname(file.originalname),
          );
        },
      }),
    }),
  )
  create(
    @Body() body: CreateNewsDto,

    @CurrentUser() user: JwtPayload,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.image =
        `/uploads/news/${file.filename}`;
    }

    return this.newsService.create(
    body,
    user.sub,
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { /* ... */ }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {

    const processedBody = {
      ...body,
      pinned: body.pinned === 'true' || body.pinned === true,
    };

    const updateData = plainToInstance(UpdateNewsDto, processedBody, {
      enableImplicitConversion: true,
    });

    if (file) {
      updateData.image = `/uploads/news/${file.filename}`;
    }

    return this.newsService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.newsService.remove(id);
  }
}
```

## backend/src\news\news.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from '../users/users.entity';
import { NewsComment } from './comments/news-comment.entity';

export enum NewsCategory {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EVENT = 'EVENT',
  EDUCATION = 'EDUCATION',
  ADMINISTRATION = 'ADMINISTRATION',
}

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'enum',
    enum: NewsCategory,
    default: NewsCategory.ANNOUNCEMENT,
  })
  category!: NewsCategory;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  image?: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  author?: User | null;
  
  @Column({
    default: false,
  })
  pinned!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => NewsComment, (comment) => comment.news)
    comments!: NewsComment[];
}
```

## backend/src\news\news.module.ts
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { News } from './news.entity';
import { NewsComment } from './comments/news-comment.entity';

import { NewsService } from './news.service';
import { NewsController } from './news.controller';

import { NewsCommentsController } from './comments/news-comments.controller';
import { NewsCommentsService } from './comments/news-comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      News,
      NewsComment,
    ]),
  ],

  controllers: [
    NewsController,
    NewsCommentsController,
  ],

  providers: [
    NewsService,
    NewsCommentsService,
  ],
})
export class NewsModule {}
```

## backend/src\news\news.service.ts
```ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { News } from './news.entity';

import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';

import { User } from '../users/users.entity';

@Injectable()
  export class NewsService {
    constructor(
      @InjectRepository(News)
      private newsRepo: Repository<News>,
    ) {}

  async create(data: CreateNewsDto, userId: number) {
    const news = this.newsRepo.create({
      ...data,
      author: { id: userId } as any,
    });

    return this.newsRepo.save(news);
  }

  async findAll(query: QueryNewsDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: FindOptionsWhere<News> = {};

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }

    if (query.category) {
      where.category = query.category;
    }

    const [items, total] =
      await this.newsRepo.findAndCount({
        where,

        relations: [
          'author',
          'author.profile',
        ],

        order: {
          pinned: 'DESC',
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
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const news = await this.newsRepo.findOne({
      where: { id },
      relations: ['author', 'author.profile'],
    });

    if (!news) {
      throw new NotFoundException(
        'News not found',
      );
    }

    return news;
  }

  async update(
    id: number,
    data: UpdateNewsDto,
  ) {
    const news = await this.findOne(id);

    Object.assign(news, data);

    return this.newsRepo.save(news);
  }

  async remove(id: number) {
    const news = await this.findOne(id);

    await this.newsRepo.remove(news);

    return {
      message: 'News deleted',
    };
  }
}
```

## backend/src\profile\profile.controller.ts
```ts
import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { ProfileService } from './profile.service';

import { UsersService } from '../users/users.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    console.log(user);
    return this.usersService.findById(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',

        filename: (req: any, file, callback) => {
          const user = req.user;

          const firstName =
            req.body.firstName
              ?.trim()
              ?.replace(/\s+/g, '-')
              ?.toLowerCase() || 'user';

          const lastName =
            req.body.lastName
              ?.trim()
              ?.replace(/\s+/g, '-')
              ?.toLowerCase() || 'profile';

          const filename =
            `${user.sub}-${firstName}-${lastName}${extname(file.originalname)}`;

          callback(null, filename);
        },
      }),
    }),
  )
  updateMe(
    @CurrentUser() user: any,

    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
    },

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.avatar =
        `/uploads/avatars/${file.filename}`;
    }

    return this.profileService.updateProfile(
      user.sub,
      body,
    );
  }
}
```

## backend/src\profile\profile.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

@Column({ nullable: true, type: 'varchar' })
  firstName?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatar?: string | null;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;
}
```

## backend/src\profile\profile.module.ts
```ts
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from './profile.entity';

import { ProfileService } from './profile.service';

import { ProfileController } from './profile.controller';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
    ]),

    UsersModule,
  ],

  providers: [ProfileService],

  controllers: [ProfileController],
})
export class ProfileModule {}
```

## backend/src\profile\profile.service.ts
```ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Profile } from './profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
  ) {}

  async updateProfile(
    userId: number,
    data: any,
  ) {
    const profile =
      await this.profileRepo.findOne({
        where: {
          user: {
            id: userId,
          },
        },
      });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found',
      );
    }

    profile.firstName =
      data.firstName ??
      profile.firstName;

    profile.lastName =
      data.lastName ??
      profile.lastName;

    profile.phone =
      data.phone ??
      profile.phone;

    profile.avatar =
      data.avatar ??
      profile.avatar;

    return this.profileRepo.save(profile);
  }
}
```

## backend/src\teachers\dto\create-teacher.dto.ts
```ts
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsString()
  @MinLength(2)
  department!: string;

  @IsString()
  @MinLength(2)
  subject!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  cabinet?: string;
}
```

## backend/src\teachers\dto\query-teacher.dto.ts
```ts
import {
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

export class QueryTeacherDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
```

## backend/src\teachers\dto\update-teacher.dto.ts
```ts
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  cabinet?: string;

  @IsOptional()
  @IsString()
  consultationHours?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

## backend/src\teachers\teachers.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { TeachersService } from './teachers.service';

import { CreateTeacherDto } from './dto/create-teacher.dto';

import { UpdateTeacherDto } from './dto/update-teacher.dto';

import { QueryTeacherDto } from './dto/query-teacher.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/guards/roles.decorator';

import { Role } from '../users/users.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('teachers')
export class TeachersController {
  constructor(
    private teachersService: TeachersService,
  ) {}

  @Get()
  findAll(
    @Query() query: QueryTeacherDto,
  ) {
    return this.teachersService.findAll(
      query,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  me(@Req() req) {
    return this.teachersService.findByUserId(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  updateMe(
    @CurrentUser() user: JwtPayload, 
    @Body() body: UpdateTeacherDto
  ) {
    return this.teachersService.updateByUserId(user.sub, body);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.teachersService.findOne(
      id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination:
          './uploads/teachers',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueName +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  create(
    @Body()
    body: CreateTeacherDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.photo =
        `/uploads/teachers/${file.filename}`;
    }

    return this.teachersService.create(
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination:
          './uploads/teachers',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueName +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    body: UpdateTeacherDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    if (file) {
      body.photo =
        `/uploads/teachers/${file.filename}`;
    }

    return this.teachersService.update(
      id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.teachersService.remove(
      id,
    );
  }
}
```

## backend/src\teachers\teachers.entity.ts
```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

import { User } from '../users/users.entity';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.teacherProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  department!: string;

  @Column()
  subject!: string;

  @Column({ nullable: true, type: 'varchar' })
  cabinet: string | null = null;

  @Column({ nullable: true, type: 'varchar' })
  consultationHours: string | null = null;

  @Column({ nullable: true, type: 'text' })
  bio: string | null = null;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  phone: string | null = null;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  email: string | null = null;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  photo: string | null = null;

  @CreateDateColumn()
  createdAt!: Date;
}
```

## backend/src\teachers\teachers.module.ts
```ts
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Teacher } from './teachers.entity';

import { TeachersController } from './teachers.controller';

import { TeachersService } from './teachers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Teacher,
    ]),
  ],

  controllers: [
    TeachersController,
  ],

  providers: [TeachersService],
})
export class TeachersModule {}
```

## backend/src\teachers\teachers.service.ts
```ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { Teacher } from './teachers.entity';

import { CreateTeacherDto } from './dto/create-teacher.dto';

import { UpdateTeacherDto } from './dto/update-teacher.dto';

import { QueryTeacherDto } from './dto/query-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
  ) {}

  async create(
    data: CreateTeacherDto,
  ) {
    const existingTeacher =
      await this.teacherRepo.findOne({
        where: {
          email: data.email,
        },
      });

    if (existingTeacher) {
      throw new BadRequestException(
        'Teacher with this email already exists',
      );
    }

    const teacher =
      this.teacherRepo.create(data);

    return this.teacherRepo.save(
      teacher,
    );
  }

  async findAll(
    query: QueryTeacherDto,
  ) {
    const page = Number(query.page ?? 1);

    const limit = Number(
      query.limit ?? 10,
    );

    const where: FindOptionsWhere<Teacher>[] = [];

    if (query.search) {
      where.push(
        {
          firstName: ILike(
            `%${query.search}%`,
          ),
        },
        {
          lastName: ILike(
            `%${query.search}%`,
          ),
        },
        {
          subject: ILike(
            `%${query.search}%`,
          ),
        },
        {
          department: ILike(
            `%${query.search}%`,
          ),
        },
      );
    }

    const [items, total] =
      await this.teacherRepo.findAndCount({
        where:
          where.length > 0
            ? where
            : {},

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

  async findByUserId(userId: number) {
    try {
      const teacher = await this.teacherRepo.findOne({
        where: {
          user: { id: userId },
        },
        relations: ['user'],
      });

      if (!teacher) {

        const newTeacher = this.teacherRepo.create({
          user: { id: userId } as any,
          firstName: '',
          lastName: '',
          department: '',
          subject: '',
          cabinet: null,
          consultationHours: null,
          bio: null,
          phone: null,
          email: '',
        });

        return this.teacherRepo.save(newTeacher);
      }

      return teacher;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw new NotFoundException('Teacher profile not found');
    }
  }

  async updateByUserId(userId: number, data: UpdateTeacherDto) {
    let teacher = await this.findByUserId(userId);


    if (!teacher?.id) {
      throw new NotFoundException('Failed to create teacher profile');
    }

    Object.assign(teacher, data);


    if (data.email) {
      teacher.email = data.email;
    }

    return this.teacherRepo.save(teacher);
  }

  async findOne(id: number) {
    const teacher =
      await this.teacherRepo.findOne({
        where: { id },
      });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    return teacher;
  }

  async update(
    id: number,
    data: UpdateTeacherDto,
  ) {
    const teacher =
      await this.findOne(id);

    if (
      data.email &&
      data.email !== teacher.email
    ) {
      const existingTeacher =
        await this.teacherRepo.findOne({
          where: {
            email: data.email,
          },
        });

      if (existingTeacher) {
        throw new BadRequestException(
          'Teacher with this email already exists',
        );
      }
    }

    Object.assign(teacher, data);

    return this.teacherRepo.save(
      teacher,
    );
  }

  async remove(id: number) {
    const teacher =
      await this.findOne(id);

    await this.teacherRepo.remove(
      teacher,
    );

    return {
      message: 'Teacher deleted',
    };
  }
}

```

## backend/src\users\users.controller.ts
```ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/guards/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from './users.entity';

import { RegisterDto } from '../auth/dto/register.dto';


@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() body: RegisterDto) {
    return this.usersService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.delete(id);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  changeRole(
    @Param('id', ParseIntPipe)
    id: number,

    @Body('role')
    role: Role,
  ) {
    return this.usersService.changeRole(
      id,
      role,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    return this.usersService.update(
      id,
      body,
    );
  }
}
```

## backend/src\users\users.entity.ts
```ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToMany } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Teacher } from 'src/teachers/teachers.entity';
import { Club } from '../clubs/clubs.entity';

export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role!: Role;
  
  @OneToOne(() => Profile, (profile) => profile.user)
  profile!: Profile;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacherProfile?: Teacher;

  @ManyToMany(() => Club, (club) => club.members)
  clubs!: Club[];
}
```

## backend/src\users\users.module.ts
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Profile } from '../profile/profile.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Teacher } from 'src/teachers/teachers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Teacher])
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

## backend/src\users\users.service.ts
```ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, User } from './users.entity';
import { Profile } from '../profile/profile.entity';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { Teacher } from 'src/teachers/teachers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    private dataSource: DataSource,
  ) {}

  async create(data: RegisterDto) {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOne(User, {
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException('A user with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = manager.create(User, {
        email: data.email,
        password: hashedPassword,
        role: data.role ?? Role.STUDENT,
      });

      const savedUser = await manager.save(user);

      const profile = manager.create(Profile, {
        user: savedUser,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      await manager.save(profile);

      if (savedUser.role === Role.TEACHER) {
        await manager.save(
          manager.create(Teacher, {
            user: savedUser,
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            department: '',
            subject: '',
            cabinet: null,
            consultationHours: null,
            bio: null,
            phone: data.phone ?? null,
            email: savedUser.email,
          }),
        );
      }

      return {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      };

    });
  }

  async update(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    const user =
      await this.userRepo.findOne({
        where: { id },
        relations: ['profile'],
      });

    if (!user) {
      throw new BadRequestException(
        'User not found',
      );
    }

    if (data.email) {
      user.email = data.email;
    }

    if (user.profile) {
      if (data.firstName !== undefined) {
        user.profile.firstName =
          data.firstName;
      }

      if (data.lastName !== undefined) {
        user.profile.lastName =
          data.lastName;
      }

      await this.profileRepo.save(
        user.profile,
      );
    }

    await this.userRepo.save(user);

    return {
      id: user.id,
      email: user.email,
      firstName:
        user.profile?.firstName,
      lastName:
        user.profile?.lastName,
      role: user.role,
    };
  }
  
  async delete(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException(
        'User not found',
      );
    }

    await this.userRepo.remove(user);

    return {
      message: 'User deleted',
    };
  }

  async changeRole(
    id: number,
    role: Role,
  ) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException(
        'User not found',
      );
    }

    user.role = role;

    await this.userRepo.save(user);

    return {
      message: 'Role updated',
      role: user.role,
    };
  }

  async findAll() {
    const users =
      await this.userRepo.find({
        relations: ['profile'],
      });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      fullName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`,
    }));
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'createdAt',
      ],
    });
  }

  async findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['profile'],
    });
  }
}
```

