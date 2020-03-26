import { HttpClient } from '@angular/common/http';
import { Optional } from '@angular/core';
import mime from 'mime-types';

import { BrowserConfigOptions, ConfigData, ConfigFormat, ConfigSchema, parse } from '../common';
import { ConfigService } from '../common/config.service';

export class ConfigBrowserService<T extends ConfigSchema> extends ConfigService<T> {
  constructor(private options: BrowserConfigOptions, @Optional() private httpClient: HttpClient) {
    super();
  }

  protected async doLoad() {
    let configData: ConfigData;
    if (this.options.provider) {
      const providedConfig = await this.options.provider();
      this.config = providedConfig as any;
    } else if (this.options.loader) {
      const loadedConfig = await this.options.loader();
      this.config = parse(loadedConfig, false);
    } else if (this.options.url) {
      const res: any = await this.httpClient.get(this.options.url).toPromise();
      configData = {
        text: res.body,
        format: this.getConfigFormat(res),
      };
      this.config = parse<T>(configData as ConfigData, false);
    } else {
      throw new Error('Either `url`, `loader` or `provider` should be provided');
    }
  }

  private getConfigFormat(response: any): ConfigFormat {
    const contentType = response.headers.get('Content-Type');
    let extension = mime.extension(contentType);
    if (!extension) {
      extension = response.url.split('.').pop();
    }
    return extension as ConfigFormat;
  }
}
