import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from './modules/jwt/strategies/jwt-auth.guard';
import { SuspensionGuard } from './common/guards/suspension.guard';

//Admin
import { EmployeeModule } from './modules/admin/employee/employee.module';
import { OptionCategoryModule as AdminOptionCategoryModule } from './modules/admin/questions_option/option_category/option_category.module';
import { OptionModule as AdminOptionModule } from './modules/admin/questions_option/option/category-question-option.module';
import { QuizModule as AdminQuizModule } from './modules/admin/quiz-question/quiz.module';
import { SectionModule } from './modules/admin/section/section.module';
import { DomainModule } from './modules/admin/domain/domain.module';
import { TraitModule } from './modules/admin/trait/trait.module';
import { FrictionsModule } from './modules/admin/friction/frictions.module';
import { RepairBonusModule } from './modules/admin/repair-bonus/repair-bonus.module';
import { ProfileAdminModule } from './modules/admin/profile/profile.module';
import { VideosAdminModule } from './modules/admin/videos/videos.module';
import { ReportAdminUserModule } from './modules/admin/report-user/report-user.module';
import { PagesAdminModule } from './modules/admin/pages/pages.module';
import { SuspensionAdminModule } from './modules/admin/suspension-user/suspension.module';
import { BlockAdminModule } from './modules/admin/block-user/block.module';
import { FaqModule } from './modules/admin/faq/faq.module';
import { ReportAdminProblemModule } from './modules/admin/report-problem/report-problem.module';

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
import { UserTraitLedgerModule } from './modules/mobile/user_trait_ledger/user-trait-ledger.module';
import { HeartModule } from './modules/mobile/heart/heart.module';
import { StarModule } from './modules/mobile/star/star.module';
import { CrossModule } from './modules/mobile/cross/cross.module';
import { DiscoverModule } from './modules/mobile/discover/discover.module';
import { UserPhotoModule } from './modules/mobile/user-photo/user-photo.module';
import { VideosModule } from './modules/mobile/videos/videos.module';
import { ReportUserModule } from './modules/mobile/report-user/report-user.module';
import { PagesModule } from './modules/mobile/pages/pages.module';
import { BlockModule } from './modules/mobile/block-user/block.module';
import { SuspensionModule } from './modules/mobile/suspension-user/suspension.module';
import { FaqmobileModule } from './modules/mobile/faq/faq.module';
import { ReportProblemModule } from './modules/mobile/report-problem/report-problem.module';
import { NotificationSettingsModule } from './modules/mobile/notification-settings/notification-settings.module';

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
    SuspensionModule,
    EmployeeModule,
    FrictionsModule,
    ScheduleModule.forRoot(),
    RepairBonusModule,
    ProfileAdminModule,
    OptionModule,
    OptionCategoryModule,
    AdminOptionCategoryModule,
    AdminOptionModule,
    AdminQuizModule,
    QuizModule,
    SettingsModule,
    UserPreferenceModule,
    UserPreferenceQuestionAnswerModule,
    UserTraitLedgerModule,
    HeartModule,
    StarModule,
    CrossModule,
    DiscoverModule,
    SectionModule,
    DomainModule,
    TraitModule,
    UserPhotoModule,
    VideosAdminModule,
    ProfileModule,
    VideosModule,
    ReportUserModule,
    ReportAdminUserModule,
    PagesAdminModule,
    PagesModule,
    BlockModule,
    SuspensionAdminModule,
    BlockAdminModule,
    FaqModule,
    FaqmobileModule,
    ReportAdminProblemModule,
    ReportProblemModule,
    NotificationSettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: SuspensionGuard,
    },
  ],
})
export class AppModule {}
