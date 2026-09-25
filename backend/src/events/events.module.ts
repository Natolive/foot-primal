import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { EventsService } from './application/events.service.js';
import { EventRepository } from './domain/event.repository.js';
import { DrizzleEventRepository } from './infrastructure/drizzle-event.repository.js';
import { EventsController } from './infrastructure/http/events.controller.js';

// Routes protégées par le guard global d'AuthModule.
@Module({
  imports: [MailModule],
  controllers: [EventsController],
  providers: [EventsService, { provide: EventRepository, useClass: DrizzleEventRepository }],
})
export class EventsModule {}
