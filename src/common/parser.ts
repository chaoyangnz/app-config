import Properties from 'java-properties';
import YAML from 'yaml';

import { resolve } from './resolver';
import { ConfigData } from './types';

export function parse<T>(configPayload: ConfigData, doResolve = true): T {
  const { text, format } = configPayload;
  let config
  if (format === 'json') {
    config = JSON.parse(text);
  } else if (format === 'yaml') {
    config = YAML.parse(text);
  } else if (format === 'properties') {
    config = Properties.of(text).objs as T;
  } else {
    throw new Error('Unrecognised file extension: only .json, .yaml and .properties are supported');
  }
  return doResolve ? resolve(config) : config;
}
