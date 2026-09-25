import type { EventDto } from '@footix/shared';
import type { User } from '../../users/domain/user.entity.js';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: Date;
  durationMinutes: number;
  maxParticipants: number;
  paymentUrl: string | null;
  createdAt: Date;
}

export type NewEvent = Omit<Event, 'id' | 'createdAt'>;

// Réponse d'une personne au sondage d'un créneau, dans l'ordre des réponses.
export type Participant = Pick<User, 'id' | 'firstName' | 'lastName'> & { eventId: string; attending: boolean };

// Personne sans compte ramenée par un inscrit, dans l'ordre d'ajout.
export interface Guest {
  id: string;
  eventId: string;
  name: string;
  invitedBy: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

const toParticipantDto = ({ id, firstName, lastName }: Participant) => ({ id, firstName, lastName });

export const toEventDto = (
  { id, title, description, location, startsAt, durationMinutes, maxParticipants, paymentUrl }: Event,
  participants: Participant[],
  guests: Guest[],
): EventDto => ({
  id,
  title,
  description,
  location,
  startsAt: startsAt.toISOString(),
  durationMinutes,
  maxParticipants,
  paymentUrl,
  participants: participants.filter((p) => p.attending).map(toParticipantDto),
  declined: participants.filter((p) => !p.attending).map(toParticipantDto),
  guests: guests.map(({ id, name, invitedBy }) => ({ id, name, invitedBy })),
});
