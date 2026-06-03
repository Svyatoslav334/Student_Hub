// backend/src/database/seed.ts
import { DataSource } from 'typeorm';
import { User, Role } from '../users/users.entity';
import { Profile } from '../profile/profile.entity';
import { Teacher } from '../teachers/teachers.entity';
import { StudentGroup } from '../student-groups/student-group.entity';
import { News } from '../news/news.entity';
import { NewsCategory } from '../news/news.entity';
import { MaterialCategory } from '../materials/categories/material-category.entity';
import { DocumentCategory } from '../documents/document-category.entity';
import * as bcrypt from 'bcrypt';

const seedDatabase = async () => {
  console.log('🌱 Початок seed даних...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 5432,
    username: 'postgres.upmwhwnlxeeysddwzkzm',
    password: 'StudentHub2026Safe',
    database: 'postgres',
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Підключення до Supabase успішне');

    const userRepo = dataSource.getRepository(User);
    const profileRepo = dataSource.getRepository(Profile);
    const teacherRepo = dataSource.getRepository(Teacher);
    const groupRepo = dataSource.getRepository(StudentGroup);
    const newsRepo = dataSource.getRepository(News);
    const materialCatRepo = dataSource.getRepository(MaterialCategory);
    const docCatRepo = dataSource.getRepository(DocumentCategory);

    console.log('🧹 Очищаємо базу...');
    await dataSource.synchronize(true);

    // === Категорії ===
    console.log('📂 Створюємо категорії...');
    await materialCatRepo.save([
      { name: 'Програмування' },
      { name: 'Математика' },
      { name: 'Веб-дизайн' },
      { name: 'Англійська' },
    ].map(data => materialCatRepo.create(data)));

    await docCatRepo.save([
      { name: 'Накази' },
      { name: 'Методичні матеріали' },
      { name: 'Розклади' },
      { name: 'Дипломні роботи' },
    ].map(data => docCatRepo.create(data)));

    // === Групи ===
    console.log('👥 Створюємо групи...');
    const groups = await groupRepo.save([
      groupRepo.create({ name: 'КН-211', year: 2024, specialty: "Комп'ютерні науки" }),
      groupRepo.create({ name: 'КН-212', year: 2024, specialty: "Комп'ютерні науки" }),
    ]);

    // === Користувачі ===
    console.log('👤 Створюємо користувачів...');
    const hash = await bcrypt.hash('123456', 10);

    const admin = await userRepo.save(userRepo.create({
      email: 'admin@studenthub.ua',
      password: hash,
      role: Role.ADMIN,
      firstName: 'Адміністратор',
      lastName: 'Системи',
    }));

    const teacher = await userRepo.save(userRepo.create({
      email: 'ivanenko@studenthub.ua',
      password: hash,
      role: Role.TEACHER,
      firstName: 'Іван',
      lastName: 'Іваненко',
    }));

    await userRepo.save(userRepo.create({
      email: 'student1@studenthub.ua',
      password: hash,
      role: Role.STUDENT,
      firstName: 'Олег',
      lastName: 'Коваленко',
      studentGroup: groups[0],
    }));

    console.log('📋 Створюємо профілі...');
    await profileRepo.save([
      profileRepo.create({ user: admin }),
      profileRepo.create({ user: teacher }),
    ]);

    await teacherRepo.save(teacherRepo.create({
      user: teacher,
      department: "Комп'ютерних наук",
      subject: 'Програмування',
    }));

    console.log('📰 Створюємо новини...');
    await newsRepo.save([
      newsRepo.create({
        title: 'Початок нового семестру',
        content: 'Шановні студенти! Новий семестр починається 3 лютого.',
        category: NewsCategory.ANNOUNCEMENT,
        pinned: true,
        author: admin,
      }),
    ]);

    console.log('🎉 Seed успішно виконано!');
    console.log('🔑 admin@studenthub.ua / 123456');

  } catch (err: any) {
    console.error('❌ Помилка:', err.message);
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }
};

seedDatabase();