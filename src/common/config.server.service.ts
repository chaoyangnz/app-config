import * as fs from 'fs';
import { merge } from 'lodash';

import { ConfigService } from './config.service';
import { ConfigFormat, ConfigSchema, ServerConfigOptions, parse, resolve } from './index';

export class ConfigServerService<T extends ConfigSchema> extends ConfigService<T> {
  constructor(private options: ServerConfigOptions) {
    super();
  }

  protected async doLoad() {
    if (this.options.provider) {
      const providedConfig = await this.options.provider();
      this.config = resolve(providedConfig as T);
    } else if (this.options.loader) {
      const loadedConfig = await this.options.loader();
      this.config = parse(loadedConfig, true);
    } else if (this.options.paths) {
      this.config = this.loadFile(this.options.paths);
    } else {
      throw new Error('Either `paths`, `loader` or `provider` should be specified');
    }
  }

  private loadFile(paths: string[] = []): T {
    const configs = paths.map(path => {
      const extension = path.split('.').pop();
      return parse({
        text: fs.readFileSync(path, 'utf8'),
        format: extension as ConfigFormat,
      });
    });
    return merge(configs);
  }
}
