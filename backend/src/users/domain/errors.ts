import { ConflictError, ForbiddenError } from '../../common/domain/errors.js';

export class EmailAlreadyUsedError extends ConflictError {
  constructor() {
    super('Un compte existe déjà avec cet email.');
  }
}

export class OwnAccessLockedError extends ForbiddenError {
  constructor() {
    super('Tu ne peux pas modifier ton propre accès : demande à un autre administrateur.');
  }
}

export class SuperAdminOnlyError extends ForbiddenError {
  constructor() {
    super('Seul un super admin peut nommer ou modifier un super admin.');
  }
}
