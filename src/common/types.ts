export type ServerConfigOptions = {
  paths?: string[];
} & ConfigOptions;

export interface ConfigOptions {
  url?: string;
  loader?: () => Promise<ConfigData>;
  provider?: () => Promise<ConfigSchema>;
}

export type BrowserConfigOptions = ConfigOptions;

export interface ConfigData {
  text: string;
  format: ConfigFormat;
}

export interface ConfigSchema {
  [key: string]: string | number | ConfigSchema | null | undefined;
}

export type ConfigFormat = 'json' | 'yaml' | 'properties';
