import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../common/domain/errors.js';

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

export class EmailNotVerifiedError extends ForbiddenError {
  constructor() {
    super("Confirme ton email avec le lien reçu à l'inscription (pense aux spams), ou réinscris-toi pour en recevoir un nouveau.");
  }
}

export class InvalidVerificationLinkError extends NotFoundError {
  constructor() {
    super('Lien de confirmation invalide, expiré ou déjà utilisé : connecte-toi, ou réinscris-toi pour en recevoir un nouveau.');
  }
}

export class VerificationPasswordMismatchError extends UnauthorizedError {
  constructor() {
    super("Ce n'est pas le mot de passe choisi à l'inscription : ressaisis-le, ou réinscris-toi pour en choisir un nouveau.");
  }
}

export class InvalidResetLinkError extends NotFoundError {
  constructor() {
    super('Lien de réinitialisation invalide, expiré ou déjà utilisé : redemande un lien depuis « Mot de passe oublié ».');
  }
}

export class WrongCurrentPasswordError extends UnauthorizedError {
  constructor() {
    super("Ce n'est pas ton mot de passe actuel : ressaisis-le, ou passe par « Mot de passe oublié » depuis la connexion.");
  }
}
