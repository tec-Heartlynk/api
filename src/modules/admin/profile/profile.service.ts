import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../mobile/profile/profile.entity';

import { UsersService } from '../../mobile/users/users.service';
import { CrossService } from '../../mobile/cross/cross.service';
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
import { UserPhotoService } from '../../mobile/user-photo/user-photo.service';

@Injectable()
export class ProfileAdminService {
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

  // Get All Profiles - with pagination and filters

  async getAllProfiles(page: number, limit: number) {
    const query = this.profileRepo
      .createQueryBuilder('profile')

      // ✅ Only User Relation
      .leftJoinAndSelect('profile.user', 'user')

      // ✅ Selected Columns
      .select([
        'profile.id',
        'profile.name',
        'profile.dob',
        'profile.identity',
        'profile.who_open_meeting',

        'user.id',
        'user.email',
        'user.isActive',
        'user.role',
      ])

      // ✅ Role Condition
      .andWhere('user.role = :role', {
        role: 'USER',
      });

    // ✅ Pagination
    query.skip((page - 1) * limit).take(limit);

    // ✅ Latest First
    query.orderBy('profile.id', 'DESC');

    const [profiles, total] = await query.getManyAndCount();

    // ✅ Response
    const data = profiles.map((profile) => ({
      user_id: profile.user?.id,
      profile_id: profile.id,

      name: profile.name,

      email: profile.user?.email,

      dob: profile.dob,

      identity: profile.identity,

      who_open_meeting: profile.who_open_meeting,

      isActive: profile.user?.isActive,
    }));

    return {
      success: true,
      total,
      page,
      limit,
      data,
    };
  }

  //Get profile detail
  async findByUserIdprofile(userId: number) {
    try {
      const profile = await this.profileRepo
        .createQueryBuilder('profile')

        .leftJoinAndSelect('profile.user', 'user')

        .leftJoinAndSelect('user.photos', 'photos')

        .leftJoinAndSelect('user.videos', 'videos')

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
        user.photos?.length ? user.photos : null,
        user.videos?.length ? user.videos : null,

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
            is_primary: item.is_primary,
          })),

          videos: user.videos?.map((item) => ({
            id: item.id,
            video_url: `${process.env.BASE_URL}/${process.env.UPLOAD_PATH}/videos/${item.video_url}`,
            video_verified: item.video_verified,
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

      // 1. Photos
      const photosStatus =
        user.photos && user.photos.length == 6 ? 'Completed' : 'Pending';

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

  //Update user status (activate/deactivate)

  // ✅ SERVICE

  async updateUserStatus(userId: number, isActive: boolean | string) {
    const profile = await this.profileRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    if (!profile || !profile.user) {
      throw new NotFoundException('Profile not found');
    }

    // ✅ Convert string/boolean properly
    const status = isActive === true || isActive === 'true';

    // ✅ Update
    profile.user.isActive = status;

    // ✅ Save user
    const updatedUser = await this.profileRepo.manager.save(profile.user);

    return {
      success: true,
      data: {
        user_id: updatedUser.id,
        isActive: updatedUser.isActive,
      },
      message: `User ${
        updatedUser.isActive ? 'Activated' : 'Deactivated'
      } Successfully`,
    };
  }
}
