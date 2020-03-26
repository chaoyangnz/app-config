import * as fs from 'fs';
import * as path from 'path';

import { parse } from './parser';
import { ConfigFormat } from './types';

describe('test parser', () => {
  process.env = {
    DB_NAME: 'postgres',
    DB_HOME: 'localhost',
    DB_PORT: '5432',
    DATABASE_URL: 'jdbc://whatever',
    PERCENTAGE: '12.999',
  };

  const resolved = {
    rate: 1,
    comment: 'b',
    percentage: 12.999,
    database: { name: 'db', timeout: 1, url: 'jdbc://whatever', utility: 12.6 },
    dbName: 'postgres',
    jdbcUrl: 'jdbc://localhost:5432/postgres',
    maxWidth: 1234,
  };

  it('should parse the yaml content without resolving', () => {
    ['yaml', 'json', 'properties'].forEach(format => {
      const text = fs.readFileSync(path.resolve(__dirname, `./fixtures/sample.${format}`), 'utf8');
      const parsedConfig = parse(
        {
          text,
          format: format as ConfigFormat,
        },
        false,
      );
      expect(parsedConfig).toEqual({
        comment: 'b',
        database: { name: 'db', timeout: 1, url: 'jdbc://${DB_HOME}:${DB_PORT}/${DB_NAME}', utility: 12.6 },
        dbName: '${DB_NAME}',
        jdbcUrl: 'jdbc://${DB_HOME}:${DB_PORT}/${DB_NAME}',
        maxWidth: 1234,
        percentage: 12.6,
        rate: 1,
      });
    });
  });

  it('should parse the yaml content with resolving', () => {
    ['yaml', 'json', 'properties'].forEach(format => {
      const text = fs.readFileSync(path.resolve(__dirname, `./fixtures/sample.${format}`), 'utf8');
      const parsedConfig = parse(
        {
          text,
          format: format as ConfigFormat,
        },
        true,
      );
      expect(parsedConfig).toEqual(parsedConfig);
    });
  });
});
