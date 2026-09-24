import { Module } from '@nestjs/common';
import { EmailDomainsService } from './application/email-domains.service.js';
import { EmailDomainRepository } from './domain/email-domain.repository.js';
import { DrizzleEmailDomainRepository } from './infrastructure/drizzle-email-domain.repository.js';
import { EmailDomainsController } from './infrastructure/http/email-domains.controller.js';

// Routes protégées par le guard global d'AuthModule.
@Module({
  controllers: [EmailDomainsController],
  providers: [EmailDomainsService, { provide: EmailDomainRepository, useClass: DrizzleEmailDomainRepository }],
  exports: [EmailDomainsService],
})
export class EmailDomainsModule {}
