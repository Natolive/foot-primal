import { EventsService } from '@src/events/application/events.service.js';
import {
  EventFullError,
  EventStartedError,
  NotAttendingError,
  NotYourGuestError,
  TooFewPlacesError,
} from '@src/events/domain/errors.js';
import { FakeMailer } from '@test/fakes/fake-mailer.js';
import { InMemoryEventRepository } from '@test/fakes/in-memory-event.repository.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';

describe('EventsService', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const match = (inDays: number, maxParticipants = 2) => ({
    title: 'Foot du jeudi',
    location: 'Urban Soccer',
    startsAt: new Date(Date.now() + inDays * DAY),
    maxParticipants,
    paymentUrl: null,
    description: null,
  });
  const person = (firstName: string) => ({ email: `${firstName}@solem.fr`, firstName, lastName: 'Dupont', passwordHash: 'x' });
  const yes = { attending: true };
  const no = { attending: false };
  let users: InMemoryUserRepository;
  let repository: InMemoryEventRepository;
  let mailer: FakeMailer;
  let events: EventsService;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    repository = new InMemoryEventRepository(users);
    mailer = new FakeMailer();
    events = new EventsService(repository, mailer);
  });

  it('lists upcoming events only, soonest first, with their participants', async () => {
    const lea = await users.create(person('Léa'));
    await repository.create(match(-1));
    const later = await events.createEvent(match(7));
    const soon = await events.createEvent(match(1));
    await events.answer(soon.id, lea, yes);
    expect(await events.findUpcoming()).toMatchObject([
      { id: soon.id, participants: [{ id: lea.id, firstName: 'Léa', lastName: 'Dupont' }], declined: [], guests: [] },
      { id: later.id, participants: [], declined: [], guests: [] },
    ]);
  });

  it('fills places once per person, refuses when full, frees a place when someone declines', async () => {
    const [lea, max, tom] = await Promise.all(['Léa', 'Max', 'Tom'].map((n) => users.create(person(n))));
    const { id } = await events.createEvent(match(1, 2));
    await events.answer(id, lea, yes);
    await events.answer(id, lea, yes);
    await events.answer(id, max, yes);
    await expect(events.answer(id, tom, yes)).rejects.toBeInstanceOf(EventFullError);
    await events.answer(id, tom, no);
    await events.answer(id, lea, no);
    const names = (list: { firstName: string }[]) => list.map((p) => p.firstName);
    const event = await events.answer(id, tom, yes);
    expect(names(event.participants)).toEqual(['Max', 'Tom']);
    expect(names(event.declined)).toEqual(['Léa']);
  });

  it('emails a calendar invite once per person, even if they change their mind', async () => {
    const [lea, max] = await Promise.all(['Léa', 'Max'].map((n) => users.create(person(n))));
    const { id } = await events.createEvent(match(1, 1));
    await events.answer(id, lea, yes);
    await events.answer(id, lea, yes);
    await expect(events.answer(id, max, yes)).rejects.toBeInstanceOf(EventFullError);
    await events.answer(id, max, no);
    await events.answer(id, lea, no);
    await events.answer(id, lea, yes);
    await events.answer(id, lea, no);
    await events.answer(id, max, yes);
    expect(mailer.sent.map((m) => m.to.email)).toEqual(['Léa@solem.fr', 'Max@solem.fr']);
    expect(mailer.sent[0].attachments![0].content).toContain(`UID:${id}@footix`);
  });

  it('closes registrations once the event has started', async () => {
    const lea = await users.create(person('Léa'));
    const past = await repository.create(match(-1));
    await expect(events.answer(past.id, lea, yes)).rejects.toBeInstanceOf(EventStartedError);
    await expect(events.answer(past.id, lea, no)).rejects.toBeInstanceOf(EventStartedError);
  });

  it('refuses fewer places than people coming, those who decline do not count', async () => {
    const [lea, max, tom] = await Promise.all(['Léa', 'Max', 'Tom'].map((n) => users.create(person(n))));
    const { id } = await events.createEvent(match(1, 4));
    await events.answer(id, lea, yes);
    await events.answer(id, max, yes);
    await events.answer(id, tom, no);
    await expect(events.updateEvent(id, match(1, 1))).rejects.toBeInstanceOf(TooFewPlacesError);
    expect(await events.updateEvent(id, { ...match(2, 2), location: 'Five' })).toMatchObject({ location: 'Five', maxParticipants: 2 });
  });

  describe('guests', () => {
    it('takes a place, only for someone coming, and refuses when full', async () => {
      const [lea, max] = await Promise.all(['Léa', 'Max'].map((n) => users.create(person(n))));
      const { id } = await events.createEvent(match(1, 2));
      await expect(events.addGuest(id, lea.id, { name: 'Paul' })).rejects.toBeInstanceOf(NotAttendingError);
      await events.answer(id, lea, yes);
      const event = await events.addGuest(id, lea.id, { name: 'Paul' });
      expect(event.guests).toEqual([{ id: expect.any(String), name: 'Paul', invitedBy: { id: lea.id, firstName: 'Léa', lastName: 'Dupont' } }]);
      await expect(events.answer(id, max, yes)).rejects.toBeInstanceOf(EventFullError);
      await expect(events.addGuest(id, lea.id, { name: 'Tom' })).rejects.toBeInstanceOf(EventFullError);
      await expect(events.updateEvent(id, match(1, 1))).rejects.toBeInstanceOf(TooFewPlacesError);
    });

    it('leaves with the person who brought them', async () => {
      const lea = await users.create(person('Léa'));
      const { id } = await events.createEvent(match(1, 4));
      await events.answer(id, lea, yes);
      await events.addGuest(id, lea.id, { name: 'Paul' });
      expect((await events.answer(id, lea, no)).guests).toEqual([]);
    });

    it('is removed by the person who brought them or by an organiser only', async () => {
      const [lea, max, orga] = await Promise.all(['Léa', 'Max', 'Orga'].map((n) => users.create(person(n))));
      const { id } = await events.createEvent(match(1, 4));
      await events.answer(id, lea, yes);
      const [paul] = (await events.addGuest(id, lea.id, { name: 'Paul' })).guests;
      const [, tom] = (await events.addGuest(id, lea.id, { name: 'Tom' })).guests;
      await expect(events.removeGuest(id, paul.id, { id: max.id, permissions: [] })).rejects.toBeInstanceOf(NotYourGuestError);
      await events.removeGuest(id, paul.id, { id: lea.id, permissions: [] });
      const event = await events.removeGuest(id, tom.id, { id: orga.id, permissions: ['planning.update_event'] });
      expect(event.guests).toEqual([]);
    });

    it('closes once the event has started', async () => {
      const lea = await users.create(person('Léa'));
      const past = await repository.create(match(-1));
      await expect(events.addGuest(past.id, lea.id, { name: 'Paul' })).rejects.toBeInstanceOf(EventStartedError);
    });
  });
});
