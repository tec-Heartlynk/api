import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { In } from 'typeorm';

import { UserTraitLedger } from './user_trait_ledger.entity';
import { CreateUserTraitLedgerDto } from './dto/create-user-trait-ledger.dto';
import { UpdateUserTraitLedgerDto } from './dto/update-user-trait-ledger.dto';

@Injectable()
export class UserTraitLedgerService {
  constructor(
    @InjectRepository(UserTraitLedger)
    private readonly repository: Repository<UserTraitLedger>,
  ) {}

  create(dto: CreateUserTraitLedgerDto) {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll() {
    return this.repository.find({
      relations: ['user', 'trait'],
    });
  }

  async findOne(id: number) {
    const data = await this.repository.findOne({
      where: { id },
      relations: ['user', 'trait'],
    });

    if (!data) {
      throw new NotFoundException('User trait ledger not found');
    }

    return data;
  }

  async update(
    id: number,
    dto: UpdateUserTraitLedgerDto,
  ) {
    const entity = await this.findOne(id);

    Object.assign(entity, dto);

    return this.repository.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);

    return this.repository.remove(entity);
  }

  async saveLedgerForUser(
    userId: number,
    traitId: number,
    traitMaxValue: number,
    userTraitValue: number,
  ): Promise<UserTraitLedger> {
    // Normalized Trait Value = Math.round((User Raw Value / Max Possible Raw Value) × 100)
    const normalizedValue = traitMaxValue === 0
      ? 0
      : Math.round((userTraitValue / traitMaxValue) * 100);

    const dto: CreateUserTraitLedgerDto = {
      user_id: userId,
      trait_id: traitId,
      trait_max_value: traitMaxValue,
      user_trait_value: userTraitValue,
      normalized_value: normalizedValue,
    };

    const entity = this.repository.create(dto);

    return this.repository.save(entity);
  }

  async storeUserTraitLedger(
    userId: number,
    ledgerData: {
      traitId: number;
      traitMaxValue: number;
      userTraitValue: number;
      normalizedValue: number;
    }[],
  ): Promise<UserTraitLedger[]> {

    const traitIds = ledgerData.map(item => item.traitId);

    // Fetch all existing records in ONE query
    const existingRecords = await this.repository.find({
      where: {
        user_id: userId,
        trait_id: In(traitIds),
      },
    });

    // Create lookup map
    const existingMap = new Map<number, UserTraitLedger>();

    existingRecords.forEach(record => {
      existingMap.set(record.trait_id, record);
    });

    const entities: UserTraitLedger[] = [];

    for (const data of ledgerData) {

      const normalizedValue =
        data.traitMaxValue === 0 ? 0 : data.normalizedValue;

      let entity = existingMap.get(data.traitId);

      if (entity) {
        // UPDATE
        entity.trait_max_value = data.traitMaxValue;
        entity.user_trait_value = data.userTraitValue;
        entity.normalized_value = normalizedValue;
      } else {
        // CREATE
        entity = this.repository.create({
          user_id: userId,
          trait_id: data.traitId,
          trait_max_value: data.traitMaxValue,
          user_trait_value: data.userTraitValue,
          normalized_value: normalizedValue,
        });
      }

      entities.push(entity);
    }

    // SINGLE bulk save query
    return await this.repository.save(entities);
  }

  async getDomainCompatibilityScores(
    user1Id: number,
    user2Id: number,
  ) {
    const domainResults = await this.repository
      .createQueryBuilder('utl')
      .innerJoin('traits', 't', 't.id = utl.trait_id')
      .innerJoin('domains', 'd', 'd.id = t.domain_id')
      .select('d.id', 'domainId')
      .addSelect('d.name', 'domainName')
      .addSelect('d.domain_weight', 'domainWeight')
      .addSelect(
        `
        ROUND(
          CAST(
            AVG(
              CASE
                WHEN utl.user_id = :user1Id
                THEN utl.normalized_value
              END
            ) AS NUMERIC
          ),
          2
        )
        `,
        'user1Average',
      )
      .addSelect(
        `
        ROUND(
          CAST(
            AVG(
              CASE
                WHEN utl.user_id = :user2Id
                THEN utl.normalized_value
              END
            ) AS NUMERIC
          ),
          2
        )
        `,
        'user2Average',
      )
      .addSelect(
        `
        ROUND(
          CAST(
            100 - ABS(
              AVG(
                CASE
                  WHEN utl.user_id = :user1Id
                  THEN utl.normalized_value
                END
              )
              -
              AVG(
                CASE
                  WHEN utl.user_id = :user2Id
                  THEN utl.normalized_value
                END
              )
            ) AS NUMERIC
          ),
          2
        )
        `,
        'compatibilityPercentage',
      )
      .where('utl.user_id IN (:...userIds)', {
        userIds: [user1Id, user2Id],
      })
      .andWhere('utl.normalized_value IS NOT NULL')
      .setParameters({
        user1Id,
        user2Id,
      })
      .groupBy('d.id')
      .addGroupBy('d.name')
      .addGroupBy('d.domain_weight')
      .orderBy('d.id', 'ASC')
      .getRawMany();

    const domains = domainResults.map((row) => ({
      domainId: Number(row.domainId),
      domainName: row.domainName,
      domainWeight: Number(row.domainWeight),
      user1Average: Number(row.user1Average),
      user2Average: Number(row.user2Average),
      compatibilityPercentage: Number(
        row.compatibilityPercentage,
      ),
    }));

    const totalWeight = domains.reduce(
      (sum, domain) => sum + domain.domainWeight,
      0,
    );

    const weightedScoreSum = domains.reduce(
      (sum, domain) =>
        sum +
        domain.compatibilityPercentage *
          domain.domainWeight,
      0,
    );

    const overallCompatibility =
      totalWeight > 0
        ? Number(
            (weightedScoreSum / totalWeight).toFixed(2),
          )
        : 0;

    return {
      overallCompatibility,
      domains,
    };
  }
}