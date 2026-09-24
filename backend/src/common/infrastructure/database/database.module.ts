import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import * as schema from './schema.js';

export const DB = Symbol('DB');
export type Database = NodePgDatabase<typeof schema> & { $client: Pool };

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: (): Database => drizzle(process.env.DATABASE_URL!, { schema }),
    },
  ],
  exports: [DB],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DB) private readonly db: Database) {}

  async onApplicationShutdown() {
    await this.db.$client.end();
  }
}
