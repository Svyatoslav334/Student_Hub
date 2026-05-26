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