import { HttpClient } from '@angular/common/http';
import { Optional} from '@angular/core';
import mime from 'mime-types';

import { BrowserConfigOptions, ConfigData, ConfigFormat, parse } from '../common';
import { ConfigService } from '../common/config.service';

export class ConfigBrowserService<T> extends ConfigService<T> {
  constructor(private options: BrowserConfigOptions, @Optional() private httpClient: HttpClient) {
    super();
  }

  protected async doLoad() {
    let configData: ConfigData;
    if (this.options.configProvider) {
      configData = await this.options.configProvider();
    } else if (this.options.url) {
      const res: any = await this.httpClient.get(this.options.url).toPromise();
      configData = {
        text: res.body,
        format: this.getConfigFormat(res),
      };
    } else {
      throw new Error('Either `configProvider` or `url` should be provided');
    }
    this.config = parse<T>(configData, false);
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
