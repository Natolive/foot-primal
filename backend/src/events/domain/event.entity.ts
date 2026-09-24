import type { EventDto } from '@primal/shared';
import type { User } from '../../users/domain/user.entity.js';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: Date;
  maxParticipants: number;
  paymentUrl: string | null;
  createdAt: Date;
}

export type NewEvent = Omit<Event, 'id' | 'createdAt'>;

// Réponse d'une personne au sondage d'un créneau, dans l'ordre des réponses.
export type Participant = Pick<User, 'id' | 'firstName' | 'lastName'> & { eventId: string; attending: boolean };

const toParticipantDto = ({ id, firstName, lastName }: Participant) => ({ id, firstName, lastName });

export const toEventDto = (
  { id, title, description, location, startsAt, maxParticipants, paymentUrl }: Event,
  participants: Participant[],
): EventDto => ({
  id,
  title,
  description,
  location,
  startsAt: startsAt.toISOString(),
  maxParticipants,
  paymentUrl,
  participants: participants.filter((p) => p.attending).map(toParticipantDto),
  declined: participants.filter((p) => !p.attending).map(toParticipantDto),
});
