import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, eq, gt, inArray } from 'drizzle-orm';
import { DB, type Database } from '../../common/infrastructure/database/database.module.js';
import { DrizzleRepository } from '../../common/infrastructure/database/drizzle.repository.js';
import { users } from '../../users/infrastructure/user.table.js';
import type { Event, NewEvent, Participant } from '../domain/event.entity.js';
import { EventRepository } from '../domain/event.repository.js';
import { eventParticipants, events } from './event.table.js';

@Injectable()
export class DrizzleEventRepository extends DrizzleRepository<typeof events, Event, NewEvent> implements EventRepository {
  constructor(@Inject(DB) db: Database) {
    super(db, events);
  }

  findUpcoming(now: Date): Promise<Event[]> {
    return this.db.select().from(events).where(gt(events.startsAt, now)).orderBy(asc(events.startsAt));
  }

  async findParticipants(eventIds: string[]): Promise<Participant[]> {
    if (!eventIds.length) return [];
    return this.db
      .select({
        eventId: eventParticipants.eventId,
        attending: eventParticipants.attending,
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(users.id, eventParticipants.userId))
      .where(inArray(eventParticipants.eventId, eventIds))
      .orderBy(asc(eventParticipants.createdAt));
  }

  answer(eventId: string, userId: string, attending: boolean): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      // Verrou sur le créneau : deux « je viens » simultanés ne dépassent pas le nombre de places.
      const [event] = await tx
        .select({ max: events.maxParticipants })
        .from(events)
        .where(eq(events.id, eventId))
        .for('update');
      if (!event) return false;
      if (attending) {
        const byEvent = eq(eventParticipants.eventId, eventId);
        const [mine] = await tx
          .select({ attending: eventParticipants.attending })
          .from(eventParticipants)
          .where(and(byEvent, eq(eventParticipants.userId, userId)));
        if (mine?.attending) return true;
        const [{ taken }] = await tx
          .select({ taken: count() })
          .from(eventParticipants)
          .where(and(byEvent, eq(eventParticipants.attending, true)));
        if (taken >= event.max) return false;
      }
      await tx
        .insert(eventParticipants)
        .values({ eventId, userId, attending })
        .onConflictDoUpdate({ target: [eventParticipants.eventId, eventParticipants.userId], set: { attending } });
      return true;
    });
  }
}
