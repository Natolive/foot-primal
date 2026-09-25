import { ics } from '@src/mail/application/ics.js';

describe('ics', () => {
  it('escapes text, writes UTC dates and folds long lines without splitting a character', () => {
    const file = ics({
      uid: 'e1@footix',
      title: 'Foot; jeudi, 5v5',
      description: `Ligne 1\n${'é'.repeat(50)}`,
      location: 'Urban Soccer',
      startsAt: new Date('2026-10-01T18:00:00Z'),
      endsAt: new Date('2026-10-01T19:00:00Z'),
      url: 'https://foot.benit.ooo/',
    });
    const lines = file.split('\r\n');
    expect(lines).toContain('SUMMARY:Foot\\; jeudi\\, 5v5');
    expect(lines).toContain('DTSTART:20261001T180000Z');
    expect(lines.every((l) => Buffer.byteLength(l) <= 75)).toBe(true);
    expect(file.replace(/\r\n /g, '')).toContain(`DESCRIPTION:Ligne 1\\n${'é'.repeat(50)}`);
    expect(file.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});
