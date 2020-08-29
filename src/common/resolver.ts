import { forIn, isNumber, isObject, isString, toNumber } from 'lodash';

import { substituteVariables } from '../var-expansion';

import { ConfigSchema } from './types';

export function resolve<T extends ConfigSchema>(obj: T): T {
  return doResolve<T>(obj);
}

function doResolve<T extends ConfigSchema>(obj: T, prefix = '') {
  forIn(obj, (value: any, key: string) => {
    const envVar = `${prefix}${key.toUpperCase()}`
    if (process.env.hasOwnProperty(envVar)) {
      // check environment variables first
      if (isString(value)) {
        // @ts-ignore
        obj[key] = process.env[envVar];
      } else if (isNumber(value)) {
        // @ts-ignore
        obj[key] = toNumber(process.env[envVar]);
      } else {
        // tslint:disable-next-line:no-console
        console.warn(`Environment variable ${envVar} is set but the value is not expected as string`);
      }
    } else if (isString(value)) {
      // do value interpolation
      const result = substituteVariables(value as string, {
        env: process.env,
      });
      if (result.error) {
        // tslint:disable-next-line:no-console
        console.warn(`substitute ${value} error`, result.error);
      }
      // @ts-ignore
      obj[key] = result.value;
    } else if (isObject(value)) {
      // @ts-ignore
      obj[key] = doResolve(value as T, `${envVar}_`);
    }
  });
  return obj;
}
