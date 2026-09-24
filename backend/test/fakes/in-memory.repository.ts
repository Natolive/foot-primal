import { BaseRepository } from '@src/common/domain/base.repository.js';

// Implémentation en mémoire de BaseRepository : les cas d'usage se testent sans base ni Nest.
export class InMemoryRepository<T extends { id: string; createdAt: Date }, C> extends BaseRepository<T, C> {
  rows: T[] = [];

  async findById(id: string) {
    return this.rows.find((r) => r.id === id) ?? null;
  }

  async findAll() {
    return this.rows;
  }

  async create(data: C) {
    const row = { ...data, id: String(this.rows.length + 1), createdAt: new Date() } as unknown as T;
    this.rows.push(row);
    return row;
  }

  async update(id: string, data: Partial<C>) {
    const row = await this.findById(id);
    if (row) Object.assign(row, data);
    return row;
  }

  async delete(id: string) {
    const before = this.rows.length;
    this.rows = this.rows.filter((r) => r.id !== id);
    return this.rows.length < before;
  }
}
