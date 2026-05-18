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

        .leftJoinAndSelect('profile.photos', 'photos')

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
        profile.who_open_meeting,
        profile.location,
        profile.latitude,
        profile.longitude,
        profile.photos?.length ? profile.photos : null,

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

      let age: number | null = null;

      if (profile.dob) {
        const today = new Date();
        const birthDate = new Date(profile.dob);

        age = today.getFullYear() - birthDate.getFullYear();

        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
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

          photos: profile.photos?.map((item) => ({
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

  //Get profile detail
  async findByUserIdprofileStatus(userId: number) {
    try {
      const profile = await this.profileRepo
        .createQueryBuilder('profile')

        .leftJoinAndSelect('profile.user', 'user')

        .leftJoinAndSelect('profile.photos', 'photos')

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

      // option mapping
      const options = await this.categoryquestionoptionRepo.find();

      const optionMap = {};

      options.forEach((item) => {
        optionMap[item.id] = item.option_title;
      });

      // =========================
      // PROFILE SECTION STATUS
      // =========================

      // profile completion calculation
      const profileFields = [
        profile.name,
        profile.dob,
        profile.identity,
        profile.who_open_meeting,
        profile.location,
        profile.latitude,
        profile.longitude,
        profile.photos?.length ? profile.photos : null,

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

      // 1. Photos
      const photosStatus =
        profile.photos && profile.photos.length == 6 ? 'Completed' : 'Pending';

      // 2. About You
      const aboutYouFields = [
        profile.name,
        profile.dob,
        profile.identity,
        profile.self_describe,
        profile.who_open_meeting,
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
      ];

      const aboutYouStatus = aboutYouFields.every(
        (field) => field !== null && field !== undefined && field !== '',
      )
        ? 'Completed'
        : 'Pending';

      // 3. Relationship Goals
      const relationshipGoalsFields = [
        user.preferences?.looking_for,
        user.preferences?.feel,
      ];

      const relationshipGoalsStatus = relationshipGoalsFields.every(
        (field) =>
          field !== null && field !== undefined && String(field).trim() !== '',
      )
        ? 'Completed'
        : 'Pending';

      // 4. Interests & Lifestyle
      const interestLifestyleFields = [
        user.preferences?.interests?.length ? user.preferences.interests : null,
        user.preferences?.fitness_level,
        user.preferences?.travel_habits,
        user.preferences?.work_life,
      ];

      const interestLifestyleStatus = interestLifestyleFields.some((field) => {
        if (Array.isArray(field)) {
          return field.length > 0;
        }

        return field !== null && field !== undefined;
      })
        ? 'Completed'
        : 'Pending';

      // 5. Compatibility Answers

      // total questions count
      const totalQuestions = await this.quizQuestionRepo.count();

      // user answered count
      const totalAnswered = user.preferenceAnswers?.length || 0;

      const compatibilityAnswersStatus =
        totalQuestions > 0 && totalAnswered === totalQuestions
          ? 'Completed'
          : 'Pending';

      // =========================
      // PROFILE COMPLETION
      // =========================

      const sections = [
        photosStatus,
        aboutYouStatus,
        relationshipGoalsStatus,
        interestLifestyleStatus,
        compatibilityAnswersStatus,
      ];

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

  //Update profile
}
