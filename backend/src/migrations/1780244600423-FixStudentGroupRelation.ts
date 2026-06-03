import { MigrationInterface, QueryRunner } from "typeorm";

export class FixStudentGroupRelation1730000000000 implements MigrationInterface {
    name = 'FixStudentGroupRelation1730000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Видаляємо стару проміжну таблицю, якщо вона залишилася
        await queryRunner.query(`DROP TABLE IF EXISTS "student_group_students_user" CASCADE;`);
        
        // Перевіряємо і додаємо колонку studentGroupId в user, якщо її немає
        const hasColumn = await queryRunner.hasColumn("user", "studentGroupId");
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE "user" ADD "studentGroupId" integer`);
        }

        // Додаємо foreign key
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD CONSTRAINT "FK_user_student_group" 
            FOREIGN KEY ("studentGroupId") REFERENCES "student_group"("id") ON DELETE SET NULL
        `);

        console.log('✅ StudentGroup relation fixed');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_student_group"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "studentGroupId"`);
    }
}