import { ConflictError, DomainError } from '../../common/domain/errors.js';

export class EmailDomainAlreadyAllowedError extends ConflictError {
  constructor() {
    super('Ce domaine est déjà autorisé.');
  }
}

export class EmailDomainNotAllowedError extends DomainError {
  constructor(domains: string[]) {
    super(
      domains.length
        ? `Utilise ton adresse pro (${domains.map((d) => `@${d}`).join(', ')}).`
        : 'Les inscriptions sont fermées : aucun domaine email n’est autorisé, préviens un administrateur.',
    );
  }
}
