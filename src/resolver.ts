import { forIn, isObject, isString } from 'lodash';

import { substituteVariables } from './var-expansion';

export class Resolver {
  load(path: string): any {
    return {};
  }

  resolve<T extends any>(obj: T): T {
    forIn(obj, (value: any, key: string) => {
      if (isString(value)) {
        const result = substituteVariables(value as string, {
          env: process.env,
        });
        if (result.error) {
          // tslint:disable-next-line:no-console
          console.warn(`substitute ${value} error`, result.error);
        }
        obj[key] = result.value;
      }
      if (isObject(value)) {
        obj[key] = this.resolve(value);
      }
    });
    return obj;
  }
}
