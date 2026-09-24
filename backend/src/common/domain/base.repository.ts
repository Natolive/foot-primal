// Port de persistance générique : chaque repository de domaine l'étend avec ses méthodes propres.
// Classe abstraite (et non interface) pour servir de jeton d'injection Nest.
export abstract class BaseRepository<TEntity, TCreate, TId = string> {
  abstract findById(id: TId): Promise<TEntity | null>;
  abstract findAll(): Promise<TEntity[]>;
  abstract create(data: TCreate): Promise<TEntity>;
  abstract update(id: TId, data: Partial<TCreate>): Promise<TEntity | null>;
  abstract delete(id: TId): Promise<boolean>;
}
