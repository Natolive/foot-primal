import { Injectable } from '@nestjs/common';
import type { AnswerEventDto, EventDto, SaveEventDto } from '@footix/shared';
import { BaseService } from '../../common/application/base.service.js';
import { EventFullError, EventStartedError, TooFewPlacesError } from '../domain/errors.js';
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
    const participants = await this.repository.findParticipants(events.map((e) => e.id));
    return events.map((e) => toEventDto(e, participants.filter((p) => p.eventId === e.id)));
  }

  async createEvent(dto: SaveEventDto): Promise<EventDto> {
    return toEventDto(await this.create(dto), []);
  }

  async updateEvent(id: string, dto: SaveEventDto): Promise<EventDto> {
    await this.findById(id);
    const participants = await this.repository.findParticipants([id]);
    const taken = participants.filter((p) => p.attending).length;
    if (taken > dto.maxParticipants) throw new TooFewPlacesError(taken);
    return toEventDto(await this.update(id, dto), participants);
  }

  async answer(id: string, userId: string, { attending }: AnswerEventDto): Promise<EventDto> {
    await this.findOpen(id);
    if (!(await this.repository.answer(id, userId, attending))) throw new EventFullError();
    return this.findDto(id);
  }

  private async findOpen(id: string): Promise<Event> {
    const event = await this.findById(id);
    if (event.startsAt <= new Date()) throw new EventStartedError();
    return event;
  }

  private async findDto(id: string): Promise<EventDto> {
    return toEventDto(await this.findById(id), await this.repository.findParticipants([id]));
  }
}
