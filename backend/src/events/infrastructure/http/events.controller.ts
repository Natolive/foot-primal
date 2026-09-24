import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import {
  answerEventSchema,
  eventSchema,
  type AnswerEventDto,
  type EventDto,
  type SaveEventDto,
  type UserDto,
} from '@footix/shared';
import { Authorize, CurrentUser } from '../../../auth/infrastructure/http/session.guard.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { EventsService } from '../../application/events.service.js';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @Authorize('events.read')
  findAll(): Promise<EventDto[]> {
    return this.events.findUpcoming();
  }

  @Post()
  @Authorize('planning.create_event')
  create(@Body(new ZodValidationPipe(eventSchema)) dto: SaveEventDto): Promise<EventDto> {
    return this.events.createEvent(dto);
  }

  @Put(':id')
  @Authorize('planning.update_event')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(eventSchema)) dto: SaveEventDto,
  ): Promise<EventDto> {
    return this.events.updateEvent(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Authorize('planning.delete_event')
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.events.delete(id);
  }

  // Réponse de la personne connectée au sondage : « je viens » ou « je ne viens pas ».
  @Put(':id/participation')
  @Authorize('events.participate')
  answer(
    @CurrentUser() user: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(answerEventSchema)) dto: AnswerEventDto,
  ): Promise<EventDto> {
    return this.events.answer(id, user.id, dto);
  }
}
