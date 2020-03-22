import { forIn, isObject, isString } from 'lodash';

import { substituteVariables } from '../var-expansion';

export function resolve<T>(obj: any): T {
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
      obj[key] = resolve(value);
    }
  });
  return obj;
}
