// Erreurs métier, indépendantes du transport : traduites en réponses HTTP par DomainErrorFilter.
export abstract class DomainError extends Error {}

export class NotFoundError extends DomainError {}

export class ConflictError extends DomainError {}

export class UnauthorizedError extends DomainError {}

export class ForbiddenError extends DomainError {}
