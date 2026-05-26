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