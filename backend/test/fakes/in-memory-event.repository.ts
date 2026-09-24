import type { Event, NewEvent } from '@src/events/domain/event.entity.js';
import { EventRepository } from '@src/events/domain/event.repository.js';
import { InMemoryRepository } from './in-memory.repository.js';
import type { InMemoryUserRepository } from './in-memory-user.repository.js';

export class InMemoryEventRepository extends InMemoryRepository<Event, NewEvent> implements EventRepository {
  participations: { eventId: string; userId: string; attending: boolean }[] = [];

  // Les inscrits sont lus dans les utilisateurs, comme la jointure en base.
  constructor(private readonly users: InMemoryUserRepository) {
    super();
  }

  async findUpcoming(now: Date) {
    return this.rows.filter((e) => e.startsAt > now).toSorted((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }

  async findParticipants(eventIds: string[]) {
    return this.participations
      .filter((p) => eventIds.includes(p.eventId))
      .map(({ eventId, userId, attending }) => {
        const { id, firstName, lastName } = this.users.rows.find((u) => u.id === userId)!;
        return { eventId, attending, id, firstName, lastName };
      });
  }

  async answer(eventId: string, userId: string, attending: boolean) {
    const event = await this.findById(eventId);
    if (!event) return false;
    const answers = this.participations.filter((p) => p.eventId === eventId);
    const mine = answers.find((p) => p.userId === userId);
    if (attending && !mine?.attending && answers.filter((p) => p.attending).length >= event.maxParticipants) return false;
    if (mine) mine.attending = attending;
    else this.participations.push({ eventId, userId, attending });
    return true;
  }
}
