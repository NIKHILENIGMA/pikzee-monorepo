import { Injectable, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '../schema'

/**
 * DbService manages the life-cycle of the PostgreSQL database connection pool
 * and exposes the Drizzle ORM client for executing type-safe queries.
 *
 * It implements OnModuleDestroy to gracefully close pool connections during
 * application shutdowns (e.g. restarts, container terminations) to avoid ghost sockets.
 */
@Injectable()
export class DbService implements OnModuleDestroy {
  /**
   * The active Drizzle ORM query runner.
   * Inject DbService and access this field to run queries (e.g. `this.db.conn.select()`).
   */
  public readonly conn: NodePgDatabase<typeof schema>

  /**
   * The underlying PostgreSQL connection pool manager.
   */
  private readonly pool: Pool

  constructor(configService: ConfigService) {
    /**
     * Retrieve the database connection string from the configuration service. The `getOrThrow` method will throw an error if the `DATABASE_URL` environment variable is not set, ensuring that the application fails fast if the database connection details are missing.
     */
    const connectionString = configService.getOrThrow<string>('DATABASE_URL')

    /**
     * Initialize a connection pool using the `pg` library. The pool is configured with the connection string and additional options to manage the number of connections and their lifecycle. The `drizzle` function is then used to create a database connection that utilizes this pool, allowing for efficient query execution and connection management throughout the application.
     */
    this.pool = new Pool({
      connectionString,
      max: 10, // Set the maximum number of connections in the pool
      idleTimeoutMillis: 30000, // Set the idle timeout for connections (in milliseconds)
      connectionTimeoutMillis: 2000,
    })

    /**
     * Create a Drizzle ORM database connection using the connection pool and the defined schema. This connection will be used for executing queries against the PostgreSQL database, leveraging the schema definitions for type safety and query building.
     */
    this.conn = drizzle(this.pool, { schema })
  }

  /**
   * Gracefully close the database connection when the module is destroyed
   */
  async onModuleDestroy() {
    await this.pool.end()
  }
}
