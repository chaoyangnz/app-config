import * as fs from 'fs';
import { merge } from 'lodash';

import { ConfigService } from './config.service';
import { ConfigFormat, ServerConfigOptions, parse } from './index';

export class ConfigServerService<T> extends ConfigService<T> {
  constructor(private options: ServerConfigOptions) {
    super();
  }

  protected async doLoad() {
    if (this.options.configProvider) {
      const configData = await this.options.configProvider();
      this.config = parse<T>(configData, true);
    } else if (this.options.paths) {
      this.config = this.loadFile(this.options.paths);
    } else {
      throw new Error('Either `configProvider` or `path` should be specified');
    }
  }

  private loadFile(paths: string[] = []): T {
    const configs = paths.map(path => {
      const extension = path.split('.').pop()
      return parse({
        text: fs.readFileSync(path, 'utf8'),
        format: extension as ConfigFormat,
      });
    })
    return merge(configs);
  }
}
