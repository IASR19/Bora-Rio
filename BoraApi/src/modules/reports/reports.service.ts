import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessException } from '../../common/exceptions/business.exception';
import { EventsService } from '../events/events.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportTargetType } from './entities/report.entity';

const REPORTS_TO_REVIEW = 3;

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reportsRepository: Repository<Report>,
    private readonly eventsService: EventsService,
  ) {}

  async create(userId: string, dto: CreateReportDto): Promise<Report> {
    const existing = await this.reportsRepository.findOne({
      where: { reporterId: userId, targetType: dto.targetType, targetId: dto.targetId },
    });
    if (existing) throw new BusinessException('Você já denunciou isso');

    const report = await this.reportsRepository.save(
      this.reportsRepository.create({
        reporterId: userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        category: dto.category,
        message: dto.message ?? null,
      }),
    );

    if (dto.targetType === ReportTargetType.EVENT) {
      const distinctReporters = await this.reportsRepository.count({
        where: { targetType: ReportTargetType.EVENT, targetId: dto.targetId },
      });
      if (distinctReporters >= REPORTS_TO_REVIEW) {
        await this.eventsService.sendBackToReview(dto.targetId);
      }
    }

    return report;
  }
}
