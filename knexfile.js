import 'dotenv/config';

const common = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'inclusive_city_hub'
  },
  pool: {
    min: Number(process.env.DB_POOL_MIN) || 2,
    max: Number(process.env.DB_POOL_MAX) || 10
  },
  acquireConnectionTimeout: Number(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  migrations: {
    directory: './db/migrations',
    tableName: process.env.KNEX_MIGRATIONS_TABLE || 'knex_migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
};

// Optionally enable SSL for PG if DB_SSL=true
if (process.env.DB_SSL === 'true' && common.client === 'pg') {
  common.connection = {
    ...common.connection,
    ssl: {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    }
  };
}

export default {
  development: common,
  production: common
};
