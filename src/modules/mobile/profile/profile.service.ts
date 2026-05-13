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
import { QuizQuestion } from '../quiz-question/quiz-question.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    private configService: ConfigService,
    private userService: UsersService,
    private crossService: CrossService,
    @InjectRepository(CategoryQuestionOption)
    private readonly categoryquestionoptionRepo: Repository<CategoryQuestionOption>,
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepo: Repository<QuizQuestion>,
  ) {}

  // Create profile for user
  async create(
    userId: number,
    dto: CreateProfileDto,
    files?: Express.Multer.File[],
  ) {
    try {
      const existing = await this.profileRepo.findOne({
        where: { user: { id: userId } },
      });

      if (existing) {
        throw new BadRequestException(
          'Profile already exists. Please update instead.',
        );
      }

      // ✅ MIN 1 IMAGE REQUIRED
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one profile image is required');
      }

      // 🔥 max already handled by multer (6)

      // ✅ validation
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one profile image is required');
      }

      // ✅ ONLY filenames array (THIS IS CORRECT)
      const photos: string[] = files.map((file) => file.filename);

      const profile = this.profileRepo.create({
        ...dto,
        photos,
        user: { id: userId },
      });

      const savedProfile = await this.profileRepo.save(profile);

      if (dto.screen_status !== undefined) {
        await this.userService.updateStatus(userId, dto.screen_status);
      }

      return savedProfile;
    } catch (error) {
      //console.error('CREATE PROFILE ERROR 👉', error);

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to create profile');
    }
  }

  //Get profile detail
  async findByUserIdprofile(userId: number) {
    try {
      const profile = await this.profileRepo
        .createQueryBuilder('profile')

        .leftJoinAndSelect('profile.user', 'user')

        .leftJoinAndSelect('user.settings', 'settings')

        .leftJoinAndSelect('user.preferences', 'preferences')

        .leftJoinAndSelect('user.preferenceAnswers', 'preferenceAnswers')

        // question relation
        .leftJoinAndSelect('preferenceAnswers.question', 'question')

        // answer relation
        .leftJoinAndSelect('preferenceAnswers.answer', 'answer')

        .where('profile.userId = :userId', { userId })

        .getOne();

      if (!profile) {
        throw new NotFoundException('Profile not found');
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
        profile.photos?.length ? profile.photos : null,

        // preferences
        profile.user.preferences?.looking_for,
        profile.user.preferences?.feel,
        profile.user.preferences?.interests?.length
          ? profile.user.preferences.interests
          : null,
        profile.user.preferences?.height,
        profile.user.preferences?.occupation,
        profile.user.preferences?.religion,
        profile.user.preferences?.ethnicity,
        profile.user.preferences?.education,
        profile.user.preferences?.language?.length
          ? profile.user.preferences.language
          : null,
        profile.user.preferences?.political_learning,
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

          photos: profile.photos?.map(
            (photo) =>
              `${process.env.BASE_URL}/${process.env.UPLOAD_PATH}/profile/${photo}`,
          ),

          user: {
            id: profile.user.id,
            email: profile.user.email,
            role: profile.user.role,
            isActive: profile.user.isActive,
            isBlocked: profile.user.isBlocked,
            status: profile.user.status,

            settings: profile.user.settings,

            preferences: profile.user.preferences
              ? {
                  ...profile.user.preferences,

                  looking_for: {
                    id: profile.user.preferences.looking_for,
                    title: optionMap[profile.user.preferences.looking_for],
                  },

                  height: {
                    id: profile.user.preferences.height,
                    title: optionMap[profile.user.preferences.height],
                  },

                  occupation: {
                    id: profile.user.preferences.occupation,
                    title: optionMap[profile.user.preferences.occupation],
                  },

                  religion: {
                    id: profile.user.preferences.religion,
                    title: optionMap[profile.user.preferences.religion],
                  },

                  ethnicity: {
                    id: profile.user.preferences.ethnicity,
                    title: optionMap[profile.user.preferences.ethnicity],
                  },

                  education: {
                    id: profile.user.preferences.education,
                    title: optionMap[profile.user.preferences.education],
                  },

                  political_learning: {
                    id: profile.user.preferences.political_learning,
                    title:
                      optionMap[profile.user.preferences.political_learning],
                  },

                  interests: profile.user.preferences.interests?.map((id) => ({
                    id,
                    title: optionMap[id],
                  })),

                  language: profile.user.preferences.language?.map((id) => ({
                    id,
                    title: optionMap[id],
                  })),
                }
              : null,

            preferenceAnswers: profile.user.preferenceAnswers?.map((item) => ({
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

        .leftJoinAndSelect('user.settings', 'settings')

        .leftJoinAndSelect('user.preferences', 'preferences')

        .leftJoinAndSelect('user.preferenceAnswers', 'preferenceAnswers')

        .leftJoinAndSelect('preferenceAnswers.question', 'question')

        .leftJoinAndSelect('preferenceAnswers.answer', 'answer')

        .where('profile.userId = :userId', { userId })

        .getOne();

      if (!profile) {
        throw new NotFoundException('Profile not found');
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
        profile.self_describe,
        profile.who_open_meeting,
        profile.location,
        profile.latitude,
        profile.longitude,
        profile.photos?.length ? profile.photos : null,

        // preferences
        profile.user.preferences?.looking_for,
        profile.user.preferences?.feel,
        profile.user.preferences?.interests?.length
          ? profile.user.preferences.interests
          : null,
        profile.user.preferences?.height,
        profile.user.preferences?.occupation,
        profile.user.preferences?.religion,
        profile.user.preferences?.ethnicity,
        profile.user.preferences?.education,
        profile.user.preferences?.language?.length
          ? profile.user.preferences.language
          : null,
        profile.user.preferences?.political_learning,
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
        profile.location,
        profile.user.preferences?.interests?.length
          ? profile.user.preferences.interests
          : null,
        profile.user.preferences?.height,
        profile.user.preferences?.occupation,
        profile.user.preferences?.religion,
        profile.user.preferences?.ethnicity,
        profile.user.preferences?.education,
        profile.user.preferences?.language?.length
          ? profile.user.preferences.language
          : null,
        profile.user.preferences?.political_learning,
      ];

      const aboutYouStatus = aboutYouFields.every(
        (field) => field !== null && field !== undefined && field !== '',
      )
        ? 'Completed'
        : 'Pending';

      // 3. Relationship Goals
      const relationshipGoalsFields = [
        profile.user.preferences?.looking_for,
        profile.user.preferences?.feel,
      ];

      const relationshipGoalsStatus = relationshipGoalsFields.every(
        (field) =>
          field !== null && field !== undefined && String(field).trim() !== '',
      )
        ? 'Completed'
        : 'Pending';

      // 4. Interests & Lifestyle
      const interestLifestyleFields = [
        profile.user.preferences?.interests?.length
          ? profile.user.preferences.interests
          : null,
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
      // 5. Compatibility Answers

      // total questions count
      const totalQuestions = await this.quizQuestionRepo.count();

      // user answered count
      const totalAnswered = profile.user.preferenceAnswers?.length || 0;

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

  async update(
    userId: number,
    dto: UpdateProfileDto,
    files?: Express.Multer.File[],
  ) {
    try {
      const profile = await this.profileRepo.findOne({
        where: { user: { id: userId } },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      // ❌ Empty update check
      const hasDtoData = Object.keys(dto).length > 0;
      const hasFiles = files && files.length > 0;

      if (!hasDtoData && !hasFiles) {
        throw new BadRequestException('No data provided for update');
      }

      // ❌ prevent overriding photos from DTO
      const { photos, ...safeDto } = dto as any;

      // 🔥 REPLACE MODE (old images removed, new only saved)
      if (hasFiles) {
        profile.photos = files.map((file) => file.filename);
      }

      // update other fields
      Object.assign(profile, safeDto);

      const updatedProfile = await this.profileRepo.save(profile);
      await this.crossService.deleteByUserId(userId);
      return updatedProfile;
    } catch (error) {
      //console.error('UPDATE PROFILE ERROR 👉', error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update profile');
    }
  }
}
