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