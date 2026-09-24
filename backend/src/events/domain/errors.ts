import { ConflictError } from '../../common/domain/errors.js';

export class EventFullError extends ConflictError {
  constructor() {
    super('Le créneau est complet : attends qu’une place se libère.');
  }
}

export class EventStartedError extends ConflictError {
  constructor() {
    super('Le créneau a déjà commencé : le sondage est fermé.');
  }
}

export class TooFewPlacesError extends ConflictError {
  constructor(taken: number) {
    super(`${taken} personnes viennent déjà : prévois au moins ${taken} places.`);
  }
}
