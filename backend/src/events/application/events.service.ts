import { Injectable } from '@nestjs/common';
import type { AddGuestDto, AnswerEventDto, EventDto, SaveEventDto, UserDto } from '@footix/shared';
import { BaseService } from '../../common/application/base.service.js';
import {
  EventFullError,
  EventStartedError,
  GuestNotFoundError,
  NotAttendingError,
  NotYourGuestError,
  TooFewPlacesError,
} from '../domain/errors.js';
import { toEventDto, type Event, type NewEvent } from '../domain/event.entity.js';
import { EventRepository } from '../domain/event.repository.js';

@Injectable()
export class EventsService extends BaseService<Event, NewEvent> {
  protected readonly notFoundMessage = 'Créneau introuvable.';

  constructor(protected override readonly repository: EventRepository) {
    super(repository);
  }

  // ponytail: pas d'historique, les créneaux passés disparaissent de la liste.
  async findUpcoming(): Promise<EventDto[]> {
    const events = await this.repository.findUpcoming(new Date());
    const ids = events.map((e) => e.id);
    const [participants, guests] = await Promise.all([this.repository.findParticipants(ids), this.repository.findGuests(ids)]);
    return events.map((e) =>
      toEventDto(
        e,
        participants.filter((p) => p.eventId === e.id),
        guests.filter((g) => g.eventId === e.id),
      ),
    );
  }

  async createEvent(dto: SaveEventDto): Promise<EventDto> {
    return toEventDto(await this.create(dto), [], []);
  }

  async updateEvent(id: string, dto: SaveEventDto): Promise<EventDto> {
    await this.findById(id);
    const [participants, guests] = await Promise.all([this.repository.findParticipants([id]), this.repository.findGuests([id])]);
    const taken = participants.filter((p) => p.attending).length + guests.length;
    if (taken > dto.maxParticipants) throw new TooFewPlacesError(taken);
    return toEventDto(await this.update(id, dto), participants, guests);
  }

  async answer(id: string, userId: string, { attending }: AnswerEventDto): Promise<EventDto> {
    await this.findOpen(id);
    if (!(await this.repository.answer(id, userId, attending))) throw new EventFullError();
    return this.findDto(id);
  }

  async addGuest(id: string, actorId: string, { name }: AddGuestDto): Promise<EventDto> {
    await this.findOpen(id);
    const result = await this.repository.addGuest(id, actorId, name);
    if (result === 'not_attending') throw new NotAttendingError();
    if (result === 'full') throw new EventFullError();
    return this.findDto(id);
  }

  // Ses propres invités, ou ceux de tout le monde avec le droit de modifier les créneaux.
  async removeGuest(id: string, guestId: string, actor: Pick<UserDto, 'id' | 'permissions'>): Promise<EventDto> {
    await this.findOpen(id);
    const guest = (await this.repository.findGuests([id])).find((g) => g.id === guestId);
    if (!guest) throw new GuestNotFoundError();
    if (guest.invitedBy.id !== actor.id && !actor.permissions.includes('planning.update_event')) throw new NotYourGuestError();
    await this.repository.removeGuest(guestId);
    return this.findDto(id);
  }

  private async findOpen(id: string): Promise<Event> {
    const event = await this.findById(id);
    if (event.startsAt <= new Date()) throw new EventStartedError();
    return event;
  }

  private async findDto(id: string): Promise<EventDto> {
    const [event, participants, guests] = await Promise.all([
      this.findById(id),
      this.repository.findParticipants([id]),
      this.repository.findGuests([id]),
    ]);
    return toEventDto(event, participants, guests);
  }
}
