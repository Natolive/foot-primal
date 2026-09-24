import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { emailDomainSchema, type EmailDomainDto, type SaveEmailDomainDto } from '@footix/shared';
import { Authorize } from '../../../auth/infrastructure/http/session.guard.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { EmailDomainsService } from '../../application/email-domains.service.js';

@Controller('email-domains')
export class EmailDomainsController {
  constructor(private readonly emailDomains: EmailDomainsService) {}

  @Get()
  @Authorize('email_domains.read')
  findAll(): Promise<EmailDomainDto[]> {
    return this.emailDomains.findAllDomains();
  }

  @Post()
  @Authorize('email_domains.create')
  create(@Body(new ZodValidationPipe(emailDomainSchema)) dto: SaveEmailDomainDto): Promise<EmailDomainDto> {
    return this.emailDomains.allow(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Authorize('email_domains.delete')
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.emailDomains.delete(id);
  }
}
