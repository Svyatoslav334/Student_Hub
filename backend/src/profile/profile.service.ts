import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { User } from '../users/users.entity';
import { SupabaseStorageService } from '../common/supabase-storage.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private storage: SupabaseStorageService,
  ) {}

  async updateProfile(userId: number, data: any, file?: Express.Multer.File) {
    const updateData: any = { ...data };

    if (file) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (user?.avatar) await this.storage.delete(user.avatar);
      updateData.avatar = await this.storage.upload(file, 'avatars');
    }

    await this.userRepo.update(userId, {
      ...(updateData.firstName !== undefined && { firstName: updateData.firstName }),
      ...(updateData.lastName !== undefined && { lastName: updateData.lastName }),
      ...(updateData.phone !== undefined && { phone: updateData.phone }),
      ...(updateData.avatar !== undefined && { avatar: updateData.avatar }),
    });

    let profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      profile = this.profileRepo.create({ user: { id: userId } as any });
    }

    if (updateData.bio !== undefined) profile.bio = updateData.bio;
    if (updateData.socialLinks !== undefined) profile.socialLinks = updateData.socialLinks;

    await this.profileRepo.save(profile);

    return this.userRepo.findOne({ where: { id: userId }, relations: ['profile'] });
  }
}