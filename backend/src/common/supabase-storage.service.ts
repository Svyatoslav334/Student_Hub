import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extname } from 'path';
import * as ws from 'ws';

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_KEY')!,
      {
        realtime: { transport: ws as any },
      },
    );
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const safeExt = extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '') || '.bin';
    const safeFilename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;

    console.log('SUPABASE_URL:', this.configService.get<string>('SUPABASE_URL'));
    console.log('Uploading to bucket: studenthub, path:', safeFilename);

    const { error } = await this.supabase.storage
      .from('studenthub')
      .upload(safeFilename, file.buffer, { 
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.log('Supabase error details:', JSON.stringify(error));
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from('studenthub')
      .getPublicUrl(safeFilename);

    return data.publicUrl;
  }

  async delete(url: string): Promise<void> {
    const parts = url.split('/studenthub/');
    if (parts.length < 2) return;
    const path = parts[1];
    await this.supabase.storage.from('studenthub').remove([path]);
  }
}