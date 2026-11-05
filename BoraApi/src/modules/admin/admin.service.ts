import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, In, SelectQueryBuilder } from 'typeorm';

import { CheckIn } from '../checkins/entities/checkin.entity';
import { Event, EventStatus } from '../events/entities/event.entity';
import { BusinessVerificationStatus, User } from '../users/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';
import { AdminQuery, AdminReviewDto, AdminUpdateUserDto, REGIONS } from './admin.dto';
import { AdminAudit } from './entities/admin-audit.entity';

const USER_FIELDS = [
  'u.id',
  'u.name',
  'u.email',
  'u.city',
  'u.role',
  'u.isActive',
  'u.language',
  'u.phoneVerified',
  'u.showInWhoIsGoing',
  'u.subscriptionStatus',
  'u.businessName',
  'u.businessVerificationStatus',
  'u.businessVerificationNote',
  'u.createdAt',
];

@Injectable()
export class AdminService {
  constructor(private readonly db: DataSource) {}

  private dates(qb: SelectQueryBuilder<any>, field: string, q: AdminQuery) {
    if (q.from && q.to && q.from > q.to) throw new BadRequestException('O início deve ser anterior ao fim.');
    if (q.from) qb.andWhere(`${field} >= :from`, { from: `${q.from}T00:00:00-03:00` });
    if (q.to) qb.andWhere(`${field} < CAST(:to AS timestamptz) + interval '1 day'`, { to: `${q.to}T00:00:00-03:00` });
    return qb;
  }

  private location(qb: SelectQueryBuilder<any>, city: string, state: string, q: AdminQuery) {
    if (q.city)
      qb.andWhere(`(${city} ILIKE :city OR ${city} ILIKE :cityUf)`, { city: q.city, cityUf: `${q.city} - __` });
    if (q.state) qb.andWhere(`${state} = :state`, { state: q.state });
    if (q.region) qb.andWhere(`${state} IN (:...states)`, { states: REGIONS[q.region] });
    return qb;
  }

  private venueState = `COALESCE(NULLIF(v.catalog_metadata->>'state', ''), substring(v.city from ' - ([A-Z]{2})$'))`;

  private eventsQuery(q: AdminQuery) {
    const qb = this.db.getRepository(Event).createQueryBuilder('e').leftJoinAndSelect('e.venue', 'v');
    this.location(qb, 'v.city', this.venueState, q);
    this.dates(qb, 'e.startsAt', q);
    if (q.category) qb.andWhere('v.category = :category', { category: q.category });
    if (q.status) qb.andWhere('e.status = :status', { status: q.status });
    if (q.q) qb.andWhere('(e.name ILIKE :q OR v.name ILIKE :q)', { q: `%${q.q}%` });
    return qb;
  }

  private async paginated<T>(
    qb: SelectQueryBuilder<any>,
    q: AdminQuery,
  ): Promise<{ items: T[]; total: number; page: number; pages: number }> {
    const [items, total] = await qb
      .skip((q.page - 1) * q.limit)
      .take(q.limit)
      .getManyAndCount();
    return { items, total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)) };
  }

  events(q: AdminQuery) {
    return this.paginated<Event>(this.eventsQuery(q).orderBy('e.createdAt', 'DESC').addOrderBy('e.id', 'ASC'), q);
  }

  private usersQuery(q: AdminQuery) {
    const qb = this.db.getRepository(User).createQueryBuilder('u').select(USER_FIELDS);
    this.location(qb, 'u.city', `substring(u.city from ' - ([A-Z]{2})$')`, q);
    this.dates(qb, 'u.createdAt', q);
    if (q.q) qb.andWhere('(u.name ILIKE :q OR u.email ILIKE :q)', { q: `%${q.q}%` });
    if (q.role) qb.andWhere('u.role = :role', { role: q.role });
    if (q.active) qb.andWhere('u.isActive = :active', { active: q.active === 'true' });
    if (q.business) qb.andWhere('u.businessVerificationStatus = :business', { business: q.business });
    return qb;
  }

  users(q: AdminQuery) {
    return this.paginated<User>(this.usersQuery(q).orderBy('u.createdAt', 'DESC').addOrderBy('u.id', 'ASC'), q);
  }

  async options() {
    const locations = await this.db
      .getRepository(Venue)
      .createQueryBuilder('v')
      .select('v.city', 'city')
      .addSelect(this.venueState, 'state')
      .distinct(true)
      .orderBy('v.city')
      .getRawMany();
    const categories = await this.db
      .getRepository(Venue)
      .createQueryBuilder('v')
      .select('v.category', 'category')
      .distinct(true)
      .orderBy('v.category')
      .getRawMany();
    return { regions: REGIONS, locations, categories: categories.map((r) => r.category) };
  }

  async dashboard(q: AdminQuery) {
    const base = this.eventsQuery(q);
    const eventIds = base.clone().select('e.id');
    const checkins = this.db
      .getRepository(CheckIn)
      .createQueryBuilder('c')
      .where(`c.eventId IN (${eventIds.getQuery()})`, eventIds.getParameters());
    this.dates(checkins, 'c.checkedInAt', q);
    const venues = this.db.getRepository(Venue).createQueryBuilder('v');
    this.location(venues, 'v.city', this.venueState, q);
    if (q.category) venues.andWhere('v.category = :category', { category: q.category });
    const [events, users, venueCount, checkinCount, statuses, cities, categories, activity] = await Promise.all([
      base.clone().getCount(),
      this.usersQuery(q).getCount(),
      venues.getCount(),
      checkins.clone().getCount(),
      base.clone().select('e.status', 'label').addSelect('COUNT(*)::int', 'count').groupBy('e.status').getRawMany(),
      base
        .clone()
        .select("COALESCE(v.city, 'Sem cidade')", 'label')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('v.city')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
      base
        .clone()
        .select('v.category', 'label')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('v.category')
        .orderBy('count', 'DESC')
        .getRawMany(),
      checkins
        .clone()
        .select("to_char(c.checked_in_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')", 'label')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('label')
        .orderBy('label', 'DESC')
        .limit(30)
        .getRawMany(),
    ]);
    return {
      events,
      users,
      venues: venueCount,
      checkins: checkinCount,
      statuses,
      cities,
      categories,
      activity: activity.reverse(),
    };
  }

  private async authorize(manager: EntityManager, actorId: string) {
    // Serialize access changes and recheck privileges after acquiring the lock.
    await manager.query('SELECT pg_advisory_xact_lock(70190431)');
    const actor = await manager.findOneBy(User, { id: actorId });
    if (actor?.role !== 'admin' || !actor.isActive) throw new ForbiddenException();
  }

  async updateUser(actorId: string, id: string, dto: AdminUpdateUserDto) {
    return this.db.transaction(async (manager) => {
      await this.authorize(manager, actorId);
      if (actorId === id && (dto.role === 'user' || dto.isActive === false))
        throw new BadRequestException('Você não pode remover seu próprio acesso administrativo.');
      const user = await manager.findOneBy(User, { id });
      if (!user) throw new NotFoundException();
      const before = Object.fromEntries(Object.keys(dto).map((key) => [key, user[key]]));
      Object.assign(user, dto);
      await manager.save(user);
      await manager.save(AdminAudit, { actorId, targetId: id, action: 'user.update', changes: { before, after: dto } });
      return { success: true };
    });
  }

  async reviewEvent(actorId: string, id: string, dto: AdminReviewDto) {
    return this.db.transaction(async (manager) => {
      await this.authorize(manager, actorId);
      const event = await manager.findOne(Event, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!event) throw new NotFoundException();
      if (event.status !== EventStatus.PENDING_REVIEW)
        throw new ConflictException('Este evento já foi revisado. Atualize a lista.');
      event.status = dto.decision === 'approved' ? EventStatus.PUBLISHED : EventStatus.REJECTED;
      await manager.save(event);
      await manager.save(AdminAudit, {
        actorId,
        targetId: id,
        action: 'event.review',
        changes: { status: event.status, note: dto.note },
      });
      return { success: true };
    });
  }

  async businessDocument(id: string) {
    const user = await this.db
      .getRepository(User)
      .createQueryBuilder('u')
      .select(['u.id', 'u.businessCnpj', 'u.businessName', 'u.businessVerificationNote'])
      .addSelect('u.businessContractFile')
      .where('u.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException();
    return {
      cnpj: user.businessCnpj,
      name: user.businessName,
      note: user.businessVerificationNote,
      document: user.businessContractFile,
    };
  }

  async reviewBusiness(actorId: string, id: string, dto: AdminReviewDto) {
    return this.db.transaction(async (manager) => {
      await this.authorize(manager, actorId);
      const user = await manager.findOne(User, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!user) throw new NotFoundException();
      if (user.businessVerificationStatus !== BusinessVerificationStatus.PENDING)
        throw new ConflictException('Este cadastro já foi revisado.');
      user.businessVerificationStatus =
        dto.decision === 'approved' ? BusinessVerificationStatus.APPROVED : BusinessVerificationStatus.REJECTED;
      user.businessVerificationNote = dto.note;
      user.businessVerifiedAt = dto.decision === 'approved' ? new Date() : null;
      await manager.save(user);
      if (dto.decision === 'approved')
        await manager.update(
          Event,
          { createdBy: id, createdAsBusiness: true, status: EventStatus.PENDING_REVIEW },
          { status: EventStatus.PUBLISHED },
        );
      await manager.save(AdminAudit, {
        actorId,
        targetId: id,
        action: 'business.review',
        changes: dto as unknown as Record<string, unknown>,
      });
      return { success: true };
    });
  }

  async audit(q: AdminQuery) {
    const qb = this.db
      .getRepository(AdminAudit)
      .createQueryBuilder('a')
      .orderBy('a.createdAt', 'DESC')
      .addOrderBy('a.id', 'ASC');
    const result = await this.paginated<AdminAudit>(qb, q);
    if (!result.items.length) return result;
    const ids = [...new Set(result.items.flatMap((item) => [item.actorId, item.targetId]))];
    const [users, events] = await Promise.all([
      this.db.getRepository(User).find({ where: { id: In(ids) }, select: { id: true, name: true }, withDeleted: true }),
      this.db
        .getRepository(Event)
        .find({ where: { id: In(ids) }, select: { id: true, name: true }, withDeleted: true }),
    ]);
    const names = new Map([...users, ...events].map((item) => [item.id, item.name]));
    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        actorName: names.get(item.actorId) ?? item.actorId,
        targetName: names.get(item.targetId) ?? item.targetId,
      })),
    };
  }
}
