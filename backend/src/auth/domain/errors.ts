import { ForbiddenError, UnauthorizedError } from '../../common/domain/errors.js';

// Même message que l'email soit inconnu ou le mot de passe faux : ne révèle pas quels comptes existent.
export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Email ou mot de passe incorrect.');
  }
}

export class SessionExpiredError extends UnauthorizedError {
  constructor() {
    super('Ta session a expiré, reconnecte-toi.');
  }
}

export class MissingPermissionError extends ForbiddenError {
  constructor() {
    super("Tu n'as pas le droit de faire cette action, demande-le à un administrateur.");
  }
}
