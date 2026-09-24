import { EmailDomainsService } from '@src/email-domains/application/email-domains.service.js';
import { EmailDomainAlreadyAllowedError, EmailDomainNotAllowedError } from '@src/email-domains/domain/errors.js';
import { InMemoryEmailDomainRepository } from '@test/fakes/in-memory-email-domain.repository.js';

describe('EmailDomainsService', () => {
  let service: EmailDomainsService;

  beforeEach(async () => {
    service = new EmailDomainsService(new InMemoryEmailDomainRepository());
    await service.allow({ domain: 'solem.fr' });
  });

  it('refuses a domain already allowed', async () => {
    await expect(service.allow({ domain: 'solem.fr' })).rejects.toBeInstanceOf(EmailDomainAlreadyAllowedError);
  });

  it('accepts only emails of an allowed domain, and lists them in the error', async () => {
    await expect(service.assertAllowed('lea@solem.fr')).resolves.toBeUndefined();
    await expect(service.assertAllowed('lea@gmail.com')).rejects.toThrow('@solem.fr');
    await expect(service.assertAllowed('lea@sub.solem.fr')).rejects.toBeInstanceOf(EmailDomainNotAllowedError);
  });

  it('closes signups once every domain is removed', async () => {
    const [{ id }] = await service.findAllDomains();
    await service.delete(id);
    await expect(service.assertAllowed('lea@solem.fr')).rejects.toThrow('Les inscriptions sont fermées');
  });
});
