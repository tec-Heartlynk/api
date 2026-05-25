import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import { CrossService } from '../cross/cross.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { calculateAge } from '../../../common/function/common-function';
import { ConfigService } from '@nestjs/config';
import { CategoryQuestionOption } from '../questions_option/option/category-question-option.entity';
import { QuizQuestion } from '../../admin/quiz-question/quiz-question.entity';
import { UserPhotoService } from '../user-photo/user-photo.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    private configService: ConfigService,
    private userService: UsersService,
    private crossService: CrossService,
    private userPhotoService: UserPhotoService,
    @InjectRepository(CategoryQuestionOption)
    private readonly categoryquestionoptionRepo: Repository<CategoryQuestionOption>,
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepo: Repository<QuizQuestion>,
  ) {}

  // Create profile for user
  async create(userId: number, dto: CreateProfileDto) {
    try {
      const existing = await this.profileRepo.findOne({
        where: { user: { id: userId } },
      });

      if (existing) {
        throw new BadRequestException(
          'Profile already exists. Please update instead.',
        );
      }

      // ✅ create profile first
      const profile = this.profileRepo.create({
        ...dto,
        user: { id: userId } as any,
      });

      const savedProfile = await this.profileRepo.save(profile);

      // ✅ update screen status
      if (dto.screen_status !== undefined) {
        await this.userService.updateStatus(userId, dto.screen_status);
      }

      return {
        success: true,
        message: 'Profile created successfully',
        data: savedProfile,
      };
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create profile');
    }
  }

  //Get profile detail
  async findByUserIdprofile(userId: number) {
    try {
      const profile = await this.profileRepo
        .createQueryBuilder('profile')

        .leftJoinAndSelect('profile.user', 'user')

        .leftJoinAndSelect('user.photos', 'photos')

        .leftJoinAndSelect('user.settings', 'settings')

        .leftJoinAndSelect('user.preferences', 'preferences')

        .leftJoinAndSelect('user.preferenceAnswers', 'preferenceAnswers')

        // question relation
        .leftJoinAndSelect('preferenceAnswers.question', 'question')

        // answer relation
        .leftJoinAndSelect('preferenceAnswers.answer', 'answer')

        .where('profile.user_id = :userId', { userId })

        .getOne();

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      const user = profile.user;
      if (!user) {
        throw new InternalServerErrorException(
          'Profile user relation is missing',
        );
      }

      // get all option titles
      const options = await this.categoryquestionoptionRepo.find();

      const optionMap = {};

      options.forEach((item) => {
        optionMap[item.id] = item.option_title;
      });

      // profile completion calculation
      const profileFields = [
        profile.name,
        profile.dob,
        profile.identity,
        profile.self_describe,
        profile.who_open_meeting,
        profile.location,
        profile.latitude,
        profile.longitude,
        user.photos?.length ? user.photos : null,

        // preferences
        user.preferences?.looking_for,
        user.preferences?.feel,
        user.preferences?.interests?.length ? user.preferences.interests : null,
        user.preferences?.height,
        user.preferences?.occupation,
        user.preferences?.religion,
        user.preferences?.ethnicity,
        user.preferences?.education,
        user.preferences?.language?.length ? user.preferences.language : null,
        user.preferences?.political_learning,
        user.preferences?.open_to_children,
        user.preferences?.pets,
        user.preferences?.drinking,
        user.preferences?.smoking,
        user.preferences?.diet,
        user.preferences?.fitness_level,
        user.preferences?.travel_habits,
        user.preferences?.work_life,
      ];

      const filledFields = profileFields.filter(
        (field) => field !== null && field !== undefined && field !== '',
      ).length;

      const profileCompletion = Math.round(
        (filledFields / profileFields.length) * 100,
      );

      // end of profile completion calculation

      // ✅ Age Calculate
      let age: number | null = null;
      if (profile.dob) {
        age = calculateAge(profile.dob);
      }

      return {
        success: true,

        profile_completion: profileCompletion,

        data: {
          id: profile.id,
          name: profile.name,
          dob: profile.dob,
          age,

          identity: profile.identity,
          self_describe: profile.self_describe,
          who_open_meeting: profile.who_open_meeting,

          location: profile.location,
          latitude: profile.latitude,
          longitude: profile.longitude,

          photos: user.photos?.map((item) => ({
            id: item.id,
            photo: `${process.env.BASE_URL}/${process.env.UPLOAD_PATH}/profile/${item.photo}`,
          })),

          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            isBlocked: user.isBlocked,
            status: user.status,
            createdAt: user.createdAt
              ? new Date(user.createdAt).toISOString().split('T')[0]
              : null,

            settings: user.settings,

            preferences: user.preferences
              ? {
                  ...user.preferences,

                  looking_for: {
                    id: user.preferences.looking_for,
                    title: optionMap[user.preferences.looking_for],
                  },

                  height: {
                    id: user.preferences.height,
                    title: optionMap[user.preferences.height],
                  },

                  occupation: {
                    id: user.preferences.occupation,
                    title: optionMap[user.preferences.occupation],
                  },

                  religion: {
                    id: user.preferences.religion,
                    title: optionMap[user.preferences.religion],
                  },

                  ethnicity: {
                    id: user.preferences.ethnicity,
                    title: optionMap[user.preferences.ethnicity],
                  },

                  education: {
                    id: user.preferences.education,
                    title: optionMap[user.preferences.education],
                  },

                  political_learning: {
                    id: user.preferences.political_learning,
                    title: optionMap[user.preferences.political_learning],
                  },

                  interests: user.preferences.interests?.map((id) => ({
                    id,
                    title: optionMap[id],
                  })),

                  language: user.preferences.language?.map((id) => ({
                    id,
                    title: optionMap[id],
                  })),
                  open_to_children: {
                    id: user.preferences.open_to_children,
                    title: optionMap[user.preferences.open_to_children],
                  },
                  pets: {
                    id: user.preferences.pets,
                    title: optionMap[user.preferences.pets],
                  },
                  drinking: {
                    id: user.preferences.drinking,
                    title: optionMap[user.preferences.drinking],
                  },

                  smoking: {
                    id: user.preferences.smoking,
                    title: optionMap[user.preferences.smoking],
                  },
                  diet: {
                    id: user.preferences.diet,
                    title: optionMap[user.preferences.diet],
                  },
                  fitness_level: {
                    id: user.preferences.fitness_level,
                    title: optionMap[user.preferences.fitness_level],
                  },
                  travel_habits: {
                    id: user.preferences.travel_habits,
                    title: optionMap[user.preferences.travel_habits],
                  },
                  work_life: {
                    id: user.preferences.work_life,
                    title: optionMap[user.preferences.work_life],
                  },
                }
              : null,

            preferenceAnswers: user.preferenceAnswers?.map((item) => ({
              id: item.id,
              q_id: item.q_id,
              ans_id: item.ans_id,
              cat_slug: item.cat_slug,

              question: {
                id: item.question?.id,
                question: item.question?.question,
              },

              answer: {
                id: item.answer?.id,
                answer: item.answer?.option_name,
              },
            })),
          },
        },
      };
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async findByUserIdprofileStatus(userId: number) {
    try {
      const profile = await this.profileRepo
        .createQueryBuilder('profile')

        .leftJoinAndSelect('profile.user', 'user')

        .leftJoinAndSelect('user.photos', 'photos')

        .leftJoinAndSelect('user.settings', 'settings')

        .leftJoinAndSelect('user.preferences', 'preferences')

        .leftJoinAndSelect('user.preferenceAnswers', 'preferenceAnswers')

        .leftJoinAndSelect('preferenceAnswers.question', 'question')

        .leftJoinAndSelect('preferenceAnswers.answer', 'answer')

        .where('profile.user_id = :userId', { userId })

        .getOne();

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      const user = profile.user;

      if (!user) {
        throw new InternalServerErrorException(
          'Profile user relation is missing',
        );
      }

      // =========================
      // COMMON VALIDATOR
      // =========================

      const isValidField = (field: any): boolean => {
        // null / undefined
        if (field === null || field === undefined) {
          return false;
        }

        // string
        if (typeof field === 'string') {
          return field.trim() !== '' && field.trim().toLowerCase() !== 'null';
        }

        // array
        if (Array.isArray(field)) {
          return field.length > 0;
        }

        return true;
      };

      // =========================
      // OPTION MAPPING
      // =========================

      const options = await this.categoryquestionoptionRepo.find();

      const optionMap = {};

      options.forEach((item) => {
        optionMap[item.id] = item.option_title;
      });

      // =========================
      // PROFILE COMPLETION
      // =========================

      const profileFields = [
        profile.name,
        profile.dob,
        profile.identity,
        profile.who_open_meeting,
        profile.location,
        profile.latitude,
        profile.longitude,

        // photos
        user.photos?.length ? user.photos : null,

        // preferences
        user.preferences?.looking_for,
        user.preferences?.feel,
        user.preferences?.interests,
        user.preferences?.height,
        user.preferences?.occupation,
        user.preferences?.religion,
        user.preferences?.ethnicity,
        user.preferences?.education,
        user.preferences?.language,
        user.preferences?.political_learning,
        user.preferences?.open_to_children,
        user.preferences?.pets,
        user.preferences?.drinking,
        user.preferences?.smoking,
        user.preferences?.diet,
        user.preferences?.fitness_level,
        user.preferences?.travel_habits,
        user.preferences?.work_life,
      ];

      const filledFields = profileFields.filter(isValidField).length;

      const profileCompletion = Math.round(
        (filledFields / profileFields.length) * 100,
      );

      // =========================
      // 1. PHOTOS
      // =========================

      const photosStatus =
        user.photos && user.photos.length === 6 ? 'Completed' : 'Pending';

      // =========================
      // 2. ABOUT YOU
      // =========================

      const aboutYouFields = [
        profile.name,
        profile.dob,
        profile.identity,
        profile.who_open_meeting,

        user.preferences?.height,
        user.preferences?.occupation,
        user.preferences?.religion,
        user.preferences?.ethnicity,
        user.preferences?.political_learning,
        user.preferences?.open_to_children,
        user.preferences?.pets,
        user.preferences?.drinking,
        user.preferences?.smoking,
        user.preferences?.diet,
      ];

      const aboutYouStatus = aboutYouFields.every(isValidField)
        ? 'Completed'
        : 'Pending';

      // =========================
      // 3. RELATIONSHIP GOALS
      // =========================

      const relationshipGoalsFields = [
        user.preferences?.looking_for,
        user.preferences?.feel,
      ];

      const relationshipGoalsStatus = relationshipGoalsFields.every(
        isValidField,
      )
        ? 'Completed'
        : 'Pending';

      // =========================
      // 4. INTERESTS & LIFESTYLE
      // =========================

      const interestLifestyleFields = [
        user.preferences?.interests,
        user.preferences?.fitness_level,
        user.preferences?.travel_habits,
        user.preferences?.work_life,
      ];

      const interestLifestyleStatus = interestLifestyleFields.every(
        isValidField,
      )
        ? 'Completed'
        : 'Pending';

      // =========================
      // 5. COMPATIBILITY ANSWERS
      // =========================

      const totalQuestions = await this.quizQuestionRepo.count();

      const totalAnswered = user.preferenceAnswers?.length || 0;

      const compatibilityAnswersStatus =
        totalQuestions > 0 && totalAnswered === totalQuestions
          ? 'Completed'
          : 'Pending';

      // =========================
      // RESPONSE
      // =========================

      return {
        success: true,

        profile_completion: profileCompletion,

        profile_sections: [
          {
            title: 'Photos',
            status: photosStatus,
          },
          {
            title: 'About you',
            status: aboutYouStatus,
          },
          {
            title: 'Relationship goals',
            status: relationshipGoalsStatus,
          },
          {
            title: 'Interests & Lifestyle',
            status: interestLifestyleStatus,
          },
          {
            title: 'Compatibility answers',
            status: compatibilityAnswersStatus,
          },
        ],
      };
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}
