import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/mobile/users/users.module';
import { AuthModule } from './modules/mobile/auth/auth.module';
import { EmployeeModule } from './modules/admin/employee/employee.module';
//import { ProfilesModule } from './modules/profiles/profiles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ProfileModule } from './modules/mobile/profile/profile.module';
import { OptionModule } from './modules/mobile/questions_option/option/option.module';
import { OptionCategoryModule } from './modules/mobile/questions_option/option_category/option_category.module';

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
  ],
})
export class AppModule {}
