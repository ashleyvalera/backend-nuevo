import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { DocumentType } from './enums/document-type.enum';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  findByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepository.findOne({ where: { userId } });
  }

  findByDocument(
    documentType: DocumentType,
    documentNumber: string,
  ): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { documentType, documentNumber },
    });
  }
}
