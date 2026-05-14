import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

//Admin
import { EmployeeModule } from './modules/admin/employee/employee.module';
import { OptionCategoryModule as AdminOptionCategoryModule } from './modules/admin/questions_option/option_category/option_category.module';
import { OptionModule as AdminOptionModule } from './modules/admin/questions_option/option/category-question-option.module';
import { QuizModule as AdminQuizModule } from './modules/admin/quiz-question/quiz.module';
import { SectionModule } from './modules/admin/section/section.module';
import { DomainModule } from './modules/admin/domain/domain.module';
import { TraitModule } from './modules/admin/trait/trait.module';

//Mobile
import { UsersModule } from './modules/mobile/users/users.module';
import { AuthModule } from './modules/mobile/auth/auth.module';
import { ProfileModule } from './modules/mobile/profile/profile.module';
import { OptionModule } from './modules/mobile/questions_option/option/category-question-option.module';
import { OptionCategoryModule } from './modules/mobile/questions_option/option_category/option_category.module';
import { QuizModule } from './modules/mobile/quiz-question/quiz.module';
import { SettingsModule } from './modules/mobile/user-settings/settings.module';
import { UserPreferenceModule } from './modules/mobile/user-preference/user-preference.module';
import { UserPreferenceQuestionAnswerModule } from './modules/mobile/user-preference-question-answer/user-preference-question-answer.module';
import { HeartModule } from './modules/mobile/heart/heart.module';
import { StarModule } from './modules/mobile/star/star.module';
import { CrossModule } from './modules/mobile/cross/cross.module';
import { DiscoverModule } from './modules/mobile/discover/discover.module';
import { UserPhotoModule } from './modules/mobile/user-photo/user-photo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    AuthModule,
    UsersModule,
    EmployeeModule,

    ScheduleModule.forRoot(),

    ProfileModule,
    OptionModule,
    OptionCategoryModule,
    AdminOptionCategoryModule,
    AdminOptionModule,
    AdminQuizModule,
    QuizModule,
    SettingsModule,
    UserPreferenceModule,
    UserPreferenceQuestionAnswerModule,
    HeartModule,
    StarModule,
    CrossModule,
    DiscoverModule,
    SectionModule,
    DomainModule,
    TraitModule,
    UserPhotoModule,
  ],
})
export class AppModule {}
