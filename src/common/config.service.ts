import { ConfigSchema } from './types';

export abstract class ConfigService<T extends ConfigSchema> {
  config!: T;
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }
    await this.doLoad();
    this.loaded = true;
  }

  protected abstract doLoad(): Promise<void>;
}
