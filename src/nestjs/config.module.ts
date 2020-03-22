import { DynamicModule, Module } from '@nestjs/common';

import { ConfigServerService, ConfigService, ServerConfigOptions } from '../common';

@Module({})
export class ConfigModule {
  static forRoot(options: ServerConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        {
          provide: ConfigService,
          useFactory: async (opts: ServerConfigOptions) => {
            const service = new ConfigServerService(opts);
            await service.load();
            return service;
          },
          inject: [CONFIG_OPTIONS],
        },
      ],
      exports: [ConfigService],
    };
  }

  // static appInitializer(configService: ConfigService<any>) {
  //   return () => configService.load();
  // }
}

export const CONFIG_OPTIONS = 'ConfigOptions';
