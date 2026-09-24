import { BaseRepository } from '../domain/base.repository.js';
import { NotFoundError } from '../domain/errors.js';

// Cas d'usage CRUD communs ; un service de domaine l'étend et ajoute ses propres règles.
export abstract class BaseService<TEntity, TCreate, TId = string> {
  protected abstract readonly notFoundMessage: string;

  protected constructor(protected readonly repository: BaseRepository<TEntity, TCreate, TId>) {}

  findAll(): Promise<TEntity[]> {
    return this.repository.findAll();
  }

  async findById(id: TId): Promise<TEntity> {
    return this.orNotFound(await this.repository.findById(id));
  }

  create(data: TCreate): Promise<TEntity> {
    return this.repository.create(data);
  }

  async update(id: TId, data: Partial<TCreate>): Promise<TEntity> {
    return this.orNotFound(await this.repository.update(id, data));
  }

  async delete(id: TId): Promise<void> {
    if (!(await this.repository.delete(id))) throw new NotFoundError(this.notFoundMessage);
  }

  protected orNotFound(entity: TEntity | null): TEntity {
    if (!entity) throw new NotFoundError(this.notFoundMessage);
    return entity;
  }
}
