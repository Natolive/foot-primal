import { BaseRepository } from '../../common/domain/base.repository.js';
import type { EmailDomain, NewEmailDomain } from './email-domain.entity.js';

export abstract class EmailDomainRepository extends BaseRepository<EmailDomain, NewEmailDomain> {
  abstract findByDomain(domain: string): Promise<EmailDomain | null>;
}
