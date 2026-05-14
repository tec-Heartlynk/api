import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';

import { Profile } from '../profile/profile.entity';
import { CategoryQuestionOption } from '../questions_option/option/category-question-option.entity';
import { HeartAction } from '../heart/heart.entity';
import { StarAction } from '../star/star.entity';
import { CrossAction } from '../cross/cross.entity';

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
  ) {}

  // ✅ GET ALL PROFILE WITH DISTANCE
  async getAllProfilesWithDistance(
    userId: number,
    page: number,
    limit: number,
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

    // ✅ Get Crossed Users
    const crossedUsers = await this.crossRepo.find({
      where: {
        from_user_id: userId,
      },
    });

    // ✅ crossed other user ids
    const crossedUserIds = crossedUsers.map((item) => item.to_user_id);

    // ✅ Get Profiles
    const query = this.profileRepo
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.photos', 'photos')
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
      .andWhere('user.status = 8');

    // ✅ Remove Crossed Profiles
    if (crossedUserIds.length > 0) {
      query.andWhere('user.id NOT IN (:...crossedUserIds)', {
        crossedUserIds,
      });
    }

    // ✅ Pagination
    query.skip((page - 1) * limit).take(limit);

    const [profiles, totalProfiles] = await query.getManyAndCount();

    // ✅ Response Data
    const data = await Promise.all(
      profiles.map(async (profile) => {
        const lat = Number(profile.latitude);
        const lng = Number(profile.longitude);

        // ✅ Distance
        const distance = this.calculateDistance(myLat, myLng, lat, lng);

        // ✅ Age
        let age: number | null = null;

        if (profile.dob) {
          const dob = new Date(profile.dob);
          const today = new Date();

          age = today.getFullYear() - dob.getFullYear();

          const monthDiff = today.getMonth() - dob.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < dob.getDate())
          ) {
            age--;
          }
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
        let interests: CategoryQuestionOption[] = [];

        if (interestIds.length > 0) {
          interests = await this.optionRepo.find({
            where: {
              id: In(interestIds),
            },
          });
        }

        // ✅ HEART CHECK
        const heartExists = await this.heartRepo.findOne({
          where: {
            from_user_id: userId, // current user
            to_user_id: profile.user?.id, // other user
          },
        });

        // ✅ STAR CHECK
        const starExists = await this.starRepo.findOne({
          where: {
            from_user_id: userId, // current user
            to_user_id: profile.user?.id, // other user
          },
        });

        // ✅ CROSS CHECK
        const crossExists = await this.crossRepo.findOne({
          where: {
            from_user_id: userId, // current user
            to_user_id: profile.user?.id, // other user
          },
        });

        return {
          id: profile.id,

          full_name: profile.name,

          bio: profile.self_describe ? profile.self_describe : '',

          identity: profile.identity,

          dob: profile.dob,

          age,

          latitude: profile.latitude,

          longitude: profile.longitude,

          location: profile.location,

          // ✅ Distance
          distance_in_km: Number(distance.toFixed(2)),
          distance_unit: 'km',

          // ✅ Photos

          photos: profile.photos?.map((item) => ({
            id: item.id,
            photo: `${process.env.BASE_URL}/${process.env.UPLOAD_PATH}/profile/${item.photo}`,
            is_primary: item.is_primary,
          })),

          // ✅ Interests
          interests: interests.map((item) => ({
            id: item.id,
            name: item.option_title,
          })),

          // ✅ Heart Status
          is_hearted: !!heartExists,

          // ✅ Star Status
          is_starred: !!starExists,

          // ✅ Cross Status
          //is_crossed: !!crossExists,

          // ✅ User Info
          user: {
            id: profile.user?.id,
            email: profile.user?.email,
            isActive: profile.user?.isActive,
          },

          verified_status: profile.user?.settings?.verified_status ?? 0,

          match_status: profile.user?.settings?.match_status ?? 0,

          // ✅ user_settings data
        };
      }),
    );

    // ✅ Sort by nearest

    data.sort((a, b) => a.distance_in_km - b.distance_in_km);

    return {
      success: true,
      total: totalProfiles,
      page,
      limit,
      data,
    };
  }

  // ✅ DISTANCE CALCULATE
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371;

    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
