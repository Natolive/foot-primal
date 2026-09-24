import { Injectable } from '@nestjs/common';
import type { EmailDomainDto, SaveEmailDomainDto } from '@footix/shared';
import { BaseService } from '../../common/application/base.service.js';
import type { EmailDomain, NewEmailDomain } from '../domain/email-domain.entity.js';
import { EmailDomainRepository } from '../domain/email-domain.repository.js';
import { EmailDomainAlreadyAllowedError, EmailDomainNotAllowedError } from '../domain/errors.js';

const toDto = ({ id, domain }: EmailDomain): EmailDomainDto => ({ id, domain });

@Injectable()
export class EmailDomainsService extends BaseService<EmailDomain, NewEmailDomain> {
  protected readonly notFoundMessage = 'Domaine introuvable.';

  constructor(protected override readonly repository: EmailDomainRepository) {
    super(repository);
  }

  async findAllDomains(): Promise<EmailDomainDto[]> {
    return (await this.findAll()).map(toDto).sort((a, b) => a.domain.localeCompare(b.domain));
  }

  async allow(dto: SaveEmailDomainDto): Promise<EmailDomainDto> {
    if (await this.repository.findByDomain(dto.domain)) throw new EmailDomainAlreadyAllowedError();
    return toDto(await this.create(dto));
  }

  // Seules les adresses d'un domaine autorisé peuvent créer un compte.
  async assertAllowed(email: string): Promise<void> {
    if (await this.repository.findByDomain(email.split('@')[1] ?? '')) return;
    throw new EmailDomainNotAllowedError((await this.findAllDomains()).map((d) => d.domain));
  }
}
