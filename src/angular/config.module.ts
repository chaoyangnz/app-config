import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { InjectionToken, ModuleWithProviders, NgModule, PLATFORM_ID } from '@angular/core';

import { BrowserConfigOptions, ConfigOptions, ConfigServerService, ServerConfigOptions } from '../common';
import { ConfigService } from '../common/config.service';

import { ConfigBrowserService } from './config.browser.service';

@NgModule({})
export class ConfigModule {
  static forRoot(options: { browser?: BrowserConfigOptions; server?: ServerConfigOptions }): ModuleWithProviders {
    return {
      ngModule: ConfigModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        {
          provide: ConfigService,
          useFactory: (opts: ServerConfigOptions, platformId: string, httpClient: HttpClient) => {
            if (isPlatformServer(platformId) && options.server) {
              return new ConfigServerService(options.server);
            }

            if (!isPlatformServer(platformId) && options.browser) {
              return new ConfigBrowserService(options.browser!, httpClient);
            }
            // tslint:disable-next-line:no-console
            console.warn('Either browser or server config options should be provided');
            return undefined;
          },
          deps: [CONFIG_OPTIONS, PLATFORM_ID, HttpClient],
        },
      ],
    };
  }

  static appInitializer(configService: ConfigService<any>) {
    return () => {
      if (configService) {
        return configService.load();
      }
    };
  }
}

export const CONFIG_OPTIONS = new InjectionToken<ServerConfigOptions>('ConfigOptions');
