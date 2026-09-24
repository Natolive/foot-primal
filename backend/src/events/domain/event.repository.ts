import { BaseRepository } from '../../common/domain/base.repository.js';
import type { Event, NewEvent, Participant } from './event.entity.js';

export abstract class EventRepository extends BaseRepository<Event, NewEvent> {
  // Créneaux pas encore commencés, du plus proche au plus lointain.
  abstract findUpcoming(now: Date): Promise<Event[]>;
  abstract findParticipants(eventIds: string[]): Promise<Participant[]>;
  // Enregistre ou change la réponse ; « je viens » seulement s'il reste une place (false si complet).
  abstract answer(eventId: string, userId: string, attending: boolean): Promise<boolean>;
}
