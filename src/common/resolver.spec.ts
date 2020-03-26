import { resolve } from './resolver';

describe('resolve test', () => {
  const config = {
    rate: 1,
    comment: 'b',
    percentage: 12.6,
    // tslint:disable-next-line:no-invalid-template-strings
    dbName: '${DB_NAME}',
    // tslint:disable-next-line:no-invalid-template-strings
    jdbcUrl: 'jdbc://${DB_HOME}:${DB_PORT}/${DB_NAME}',
    maxWidth: 1234,
    database: {
      timeout: 1,
      name: 'db',
      utility: 12.6,
      // tslint:disable-next-line:no-invalid-template-strings
      url: 'jdbc://${DB_HOME}:${DB_PORT}/${DB_NAME}',
    },
  };

  it('test resolve function', () => {
    process.env = {
      DB_NAME: 'postgres',
      DB_HOME: 'localhost',
      DB_PORT: '5432',
      DATABASE_URL: 'jdbc://whatever',
      PERCENTAGE: '12.999',
    };

    const resolvedConfig = resolve(config);

    expect(resolvedConfig).toEqual({
      rate: 1,
      comment: 'b',
      percentage: 12.999,
      database: { name: 'db', timeout: 1, url: 'jdbc://whatever', utility: 12.6 },
      dbName: 'postgres',
      jdbcUrl: 'jdbc://localhost:5432/postgres',
      maxWidth: 1234,
    });
  });
});
