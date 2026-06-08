import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, MoreThan } from 'typeorm';
import {
  calculateAge,
  calculateDistance,
} from '../../../common/function/common-function';
import { ConfigService } from '@nestjs/config';

import { Profile } from '../profile/profile.entity';
import { CategoryQuestionOption } from '../questions_option/option/category-question-option.entity';
import { HeartAction } from '../heart/heart.entity';
import { StarAction } from '../star/star.entity';
import { CrossAction } from '../cross/cross.entity';
import { UserPreference } from '../user-preference/user-preference.entity';
import { DailyProfileView } from './daily-profile-view.entity';

@Injectable()
export class DiscoverService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(CategoryQuestionOption)
    private readonly optionRepo: Repository<CategoryQuestionOption>,

    @InjectRepository(HeartAction)
    private readonly heartRepo: Repository<HeartAction>,

    @InjectRepository(StarAction)
    private readonly starRepo: Repository<StarAction>,

    @InjectRepository(CrossAction)
    private readonly crossRepo: Repository<CrossAction>,
    @InjectRepository(UserPreference)
    private readonly userPreferenceRepo: Repository<UserPreference>,

    @InjectRepository(DailyProfileView)
    private readonly dailyProfileViewRepo: Repository<DailyProfileView>,
    private readonly configService: ConfigService,
  ) {}

  // ✅ GET ALL PROFILE WITH DISTANCE
  async getAllProfilesWithDistance(
    userId: number,
    page: number,
    limit: number,
    minAge?: number,
    maxAge?: number,
    maxDistance?: number,
    interests?: string,
  ) {
    // ✅ Current User Profile
    const myProfile = await this.profileRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user', 'user.userPreferences'],
    });

    if (!myProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const myLat = Number(myProfile.latitude);
    const myLng = Number(myProfile.longitude);

    const WhoOpenMeeting = myProfile.who_open_meeting;

    //Current User Interests

    const userPreferenceData = await this.userPreferenceRepo.findOne({
      where: {
        user_id: userId,
      },
    });

    const myInterests = userPreferenceData?.interests || [];

    // ✅ Get Crossed Users
    const crossedUsers = await this.crossRepo.find({
      where: {
        from_user_id: userId,
      },
    });

    // ✅ crossed other user ids
    const crossedUserIds = crossedUsers.map((item) => item.to_user_id);
    // ✅ Current User Cross Count
    const crossedCount = crossedUsers.length;

    // ✅ DAILY FREE LIMIT
    const DAILY_FREE_LIMIT = Number(
      this.configService.get<string>('DAILY_FREE_LIMIT') || 10,
    );

    // ✅ Last 24 Hours
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    // ✅ Today crossed count
    const todayCrossCount = await this.crossRepo.count({
      where: {
        from_user_id: userId,
        createdAt: MoreThan(last24Hours),
      },
    });

    // ✅ Remaining limit
    const remainingLimit = DAILY_FREE_LIMIT - todayCrossCount;

    // ✅ limit reached
    if (remainingLimit <= 0) {
      return {
        success: true,
        total: 0,
        page,
        limit,
        crossed_count: crossedCount,
        message: 'Daily free profile limit reached',
        data: [],
      };
    }

    // ✅ Get Profiles
    const query = this.profileRepo
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.photos', 'photos')
      .leftJoinAndSelect('user.userPreferences', 'userPreferences')
      .leftJoinAndMapOne(
        'user.settings',
        'user_settings',
        'settings',
        'settings.user_id = user.id',
      )
      .where('user.id != :userId', {
        userId,
      })
      .andWhere('user.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('user.status = 10');

    // ✅ Dynamic Age Filter
    if (minAge && maxAge) {
      query.andWhere(
        `
      DATE_PART(
        'year',
        AGE(CURRENT_DATE, profile.dob)
      ) BETWEEN :minAge AND :maxAge
      `,
        {
          minAge,
          maxAge,
        },
      );
    }

    // ✅ WhoOpenMeeting Filter
    const normalizedWhoOpenMeeting = WhoOpenMeeting?.trim()?.toLowerCase();

    // ✅ WhoOpenMeeting Filter
    if (normalizedWhoOpenMeeting) {
      query.andWhere('LOWER(TRIM(profile.who_open_meeting)) IN (:...values)', {
        values: [normalizedWhoOpenMeeting],
      });
    }

    // ✅ Remove Crossed Profiles
    if (crossedUserIds.length > 0) {
      query.andWhere('user.id NOT IN (:...crossedUserIds)', {
        crossedUserIds,
      });
    }

    // ✅ Dynamic Distance Filter
    if (maxDistance !== undefined && maxDistance !== null) {
      const distanceLimit = Number(maxDistance); // dynamic input (10, 30, 50...)

      query.orWhere(
        `
    profile.latitude IS NOT NULL
    AND profile.longitude IS NOT NULL
    AND
    (
      6371 * ACOS(
        LEAST(1, GREATEST(-1,
          COS(RADIANS(:myLat)) *
          COS(RADIANS(CAST(profile.latitude AS DOUBLE PRECISION))) *
          COS(RADIANS(CAST(profile.longitude AS DOUBLE PRECISION)) - RADIANS(:myLng)) +
          SIN(RADIANS(:myLat)) *
          SIN(RADIANS(CAST(profile.latitude AS DOUBLE PRECISION)))
        ))
      )
    ) <= :maxDistance
    `,
        {
          myLat,
          myLng,
          maxDistance: distanceLimit,
        },
      );
    }

    // ✅ Dynamic + Default Interest Filter

    const finalInterests =
      interests && interests.trim().length > 0
        ? interests.split(',').map((item) => item.trim())
        : myInterests.map((item) => item.toString());

    if (finalInterests.length > 0) {
      const interestConditions: string[] = [];
      const interestParams: any = {};

      finalInterests.forEach((id, index) => {
        interestConditions.push(`up.interests::text LIKE :interest${index}`);

        interestParams[`interest${index}`] = `%${id}%`;
      });

      query.andWhere(
        `
    EXISTS (
      SELECT 1
      FROM user_preferences up
      WHERE up.user_id = "user"."id"
      AND (
        ${interestConditions.join(' OR ')}
      )
    )
    `,
        interestParams,
      );
    }

    //Add LookingFor Filter
    const LookingFor = Number(userPreferenceData?.looking_for);

    if (LookingFor) {
      query.andWhere('userPreferences.looking_for = :LookingFor', {
        LookingFor,
      });
    }

    // ✅ Pagination
    // ✅ Final Limit
    const finalLimit = Math.min(limit, remainingLimit);

    query.skip((page - 1) * finalLimit).take(finalLimit);

    const [profiles, totalProfiles] = await query.getManyAndCount();

    // ✅ Response Data
    const data = await Promise.all(
      profiles.map(async (profile) => {
        const lat = Number(profile.latitude);
        const lng = Number(profile.longitude);

        // ✅ Profile Settings
        const profileSettings = profile.user?.settings;

        // ✅ Distance
        const distance = calculateDistance(myLat, myLng, lat, lng);

        // ✅ Age Calculate
        let age: number | null = null;
        if (profile.dob) {
          age = calculateAge(profile.dob);
        }

        // ✅ Interest IDs
        let interestIds: number[] = [];

        profile.user?.userPreferences?.forEach((pref) => {
          if (pref.interests && Array.isArray(pref.interests)) {
            interestIds.push(...pref.interests);
          }
        });

        // ✅ Remove duplicate ids
        interestIds = [...new Set(interestIds)];

        // ✅ Get Interest Names
        let interestsData: CategoryQuestionOption[] = [];

        if (interestIds.length > 0) {
          interestsData = await this.optionRepo.find({
            where: {
              id: In(interestIds),
            },
          });
        }

        // ✅ HEART CHECK
        const heartExists = await this.heartRepo.findOne({
          where: {
            from_user_id: userId,
            to_user_id: profile.user?.id,
          },
        });

        // mutualLike liked user?
        const chatWith = await this.heartRepo.exist({
          where: {
            from_user_id: profile.user?.id,
            to_user_id: userId,
          },
        });

        // Both liked each other
        const mutualLike = !!heartExists && chatWith;

        // ✅ STAR CHECK
        const starExists = await this.starRepo.findOne({
          where: {
            from_user_id: userId,
            to_user_id: profile.user?.id,
          },
        });

        //Discover Screen Text

        const compatibilityMessages = {
          emotional_relational_style:
            'You both seem to value emotional consistency and mutual understanding.',

          cognitive_decision_style:
            'You appear to approach decisions in a similar, thoughtful way.',

          values_intimacy_relationship_intent:
            'You seem aligned on the kind of connection you’re looking for.',

          lifestyle_daily_rhythm:
            'Your everyday lifestyle patterns appear naturally compatible.',

          communication_style:
            'You may communicate in ways that feel clear and comfortable to each other.',

          independence_togetherness:
            'You share a similar balance between closeness and personal space.',
        };

        // Get all keys
        const keys = Object.keys(compatibilityMessages);

        // Random key
        const randomKey = keys[Math.floor(Math.random() * keys.length)];

        // Random value
        const randomValue = compatibilityMessages[randomKey];

        console.log({
          key: randomKey,
          value: randomValue,
        });

        return {
          id: profile.id,

          full_name: profile.name,

          discover_text: randomValue,

          identity: profile.identity,

          self_describe: profile.self_describe || '',

          dob: profile.dob,

          age: profileSettings?.age ? age : 'hidden',

          latitude: profile.latitude,

          longitude: profile.longitude,

          location: profile.location,

          // ✅ DISTANCE
          distance_in_km: profileSettings?.distance
            ? Number(distance.toFixed(2))
            : 'hidden',

          distance_unit: profileSettings?.distance ? 'km' : 'hidden',

          // ✅ Photos
          photos:
            profile.user?.photos?.map((item) => ({
              id: item.id,
              photo: `${process.env.BASE_URL}/${process.env.UPLOAD_PATH}/profile/${item.photo}`,
              is_primary: item.is_primary,
            })) || [],

          // ✅ Interests
          interests: interestsData.map((item) => ({
            id: item.id,
            name: item.option_title,
          })),

          // ✅ Heart Status
          is_hearted: !!heartExists,

          // ✅ Star Status
          is_starred: !!starExists,

          chat_with: mutualLike,

          // ✅ User Info
          user: {
            id: profile.user?.id,
            email: profile.user?.email,
            isActive: profile.user?.isActive,
          },

          verified_status: profile.user?.settings?.verified_status ?? 0,

          match_status: profile.user?.settings?.match_status ?? 0,
        };
      }),
    );

    // ✅ Sort by nearest

    data.sort((a, b) => {
      const distanceA =
        typeof a.distance_in_km === 'number' ? a.distance_in_km : Infinity;

      const distanceB =
        typeof b.distance_in_km === 'number' ? b.distance_in_km : Infinity;

      return distanceA - distanceB;
    });

    return {
      success: true,

      total: totalProfiles,

      page,

      daily_limit: DAILY_FREE_LIMIT,

      used_limit: todayCrossCount,

      remaining_limit: remainingLimit,

      crossed_count: crossedCount,

      data,
    };
  }

  // ✅ DISTANCE CALCULATE
}
