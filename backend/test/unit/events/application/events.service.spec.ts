import { EventsService } from '@src/events/application/events.service.js';
import { EventFullError, EventStartedError, TooFewPlacesError } from '@src/events/domain/errors.js';
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
  let events: EventsService;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    repository = new InMemoryEventRepository(users);
    events = new EventsService(repository);
  });

  it('lists upcoming events only, soonest first, with their participants', async () => {
    const lea = await users.create(person('Léa'));
    await repository.create(match(-1));
    const later = await events.createEvent(match(7));
    const soon = await events.createEvent(match(1));
    await events.answer(soon.id, lea.id, yes);
    expect(await events.findUpcoming()).toMatchObject([
      { id: soon.id, participants: [{ id: lea.id, firstName: 'Léa', lastName: 'Dupont' }], declined: [] },
      { id: later.id, participants: [], declined: [] },
    ]);
  });

  it('fills places once per person, refuses when full, frees a place when someone declines', async () => {
    const [lea, max, tom] = await Promise.all(['Léa', 'Max', 'Tom'].map((n) => users.create(person(n))));
    const { id } = await events.createEvent(match(1, 2));
    await events.answer(id, lea.id, yes);
    await events.answer(id, lea.id, yes);
    await events.answer(id, max.id, yes);
    await expect(events.answer(id, tom.id, yes)).rejects.toBeInstanceOf(EventFullError);
    await events.answer(id, tom.id, no);
    await events.answer(id, lea.id, no);
    const names = (list: { firstName: string }[]) => list.map((p) => p.firstName);
    const event = await events.answer(id, tom.id, yes);
    expect(names(event.participants)).toEqual(['Max', 'Tom']);
    expect(names(event.declined)).toEqual(['Léa']);
  });

  it('closes registrations once the event has started', async () => {
    const lea = await users.create(person('Léa'));
    const past = await repository.create(match(-1));
    await expect(events.answer(past.id, lea.id, yes)).rejects.toBeInstanceOf(EventStartedError);
    await expect(events.answer(past.id, lea.id, no)).rejects.toBeInstanceOf(EventStartedError);
  });

  it('refuses fewer places than people coming, those who decline do not count', async () => {
    const [lea, max, tom] = await Promise.all(['Léa', 'Max', 'Tom'].map((n) => users.create(person(n))));
    const { id } = await events.createEvent(match(1, 4));
    await events.answer(id, lea.id, yes);
    await events.answer(id, max.id, yes);
    await events.answer(id, tom.id, no);
    await expect(events.updateEvent(id, match(1, 1))).rejects.toBeInstanceOf(TooFewPlacesError);
    expect(await events.updateEvent(id, { ...match(2, 2), location: 'Five' })).toMatchObject({ location: 'Five', maxParticipants: 2 });
  });
});
