// Declare stuff here

import { ClassMock, Type } from './class-mock';

declare module 'jest-extension' {
  export function mockClass<Class>(service: Type<Class>): Type<ClassMock<Class>>;
}
