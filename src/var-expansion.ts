export interface Result {
  value: string;
  error?: { position?: number; message: string };
}

export interface Options {
  env?: Env | EnvResolver;
  specialVars?: string[];
  ignoreErrors?: boolean;
}

interface Context {
  env: EnvResolver;
  cachedEnv: Env;
  specialVars?: string[];
  ignoreErrors: boolean;
}

type Value = void | null | string | number | Function;

interface Env {
  [name: string]: Value;
}

type EnvResolver = (name: string) => Value;

/**
 * Substitute all the occurrences of environ variables in a text
 *
 * @param {String} text - Text with variables to be substituted
 * @param {Object|Function} options.env - Environ variables
 * @param {String|array} options.specialVars - List of special (single char) variables
 */
export function substituteVariables(text: string, options: Options): Result {
  const env: EnvResolver =
    typeof options.env === 'function'
      ? (options.env as EnvResolver)
      : createResolverFromMapping(options.env != null ? options.env : {});
  const context: Context = {
    env,
    cachedEnv: {},
    specialVars: options.specialVars,
    ignoreErrors: Boolean(options.ignoreErrors),
  };
  const { value, error } = substituteVariablesInternal(text, 0, '', context);
  return { value: String(value), error };
}

function createResolverFromMapping(obj: any): EnvResolver {
  return (name) => obj[name];
}

function resolveVariable(context: Context, name: string) {
  if (name in context.cachedEnv) {
    let value = context.cachedEnv[name];
    if (typeof value === 'function') {
      value = value();
    }
    return value ? String(value) : '';
  } else {
    let value = context.env(name);
    context.cachedEnv[name] = value;
    if (typeof value === 'function') {
      value = value();
    }
    return value ? String(value) : '';
  }
}

function substituteVariablesInternal(
  str: string,
  position: number,
  result: string,
  context: Context,
): Result {
  if (position === -1 || !str) {
    return { value: result, error: undefined };
  } else {
    let index = str.indexOf('$', position);

    if (index === -1) {
      // no $
      result += str.substring(position);
      position = -1;
      return { value: result, error: undefined };
    } else {
      // $ found
      let variable;
      let endIndex;
      result += str.substring(position, index);

      if (str.charAt(index + 1) === '{') {
        // ${VAR}
        endIndex = str.indexOf('}', index);
        if (endIndex === -1) {
          // '}' not found
          if (context.ignoreErrors) {
            variable = str.substring(index + 2);
          } else {
            return {
              value: result,
              error: {
                position,
                message: 'unexpected EOF while looking for matching }',
              },
            };
          }
        } else {
          // '}' found
          variable = str.substring(index + 2, endIndex);
          endIndex++;
        }
        if (!variable) {
          result += '${}';
        }
      } else {
        // $VAR
        index++; // skip $
        endIndex = -1;
        // special single char vars
        if (
          context.specialVars &&
          context.specialVars.indexOf(str[index]) !== -1
        ) {
          variable = str[index];
          endIndex = index + 1;
        } else {
          // search for var end
          for (let i = index, len = str.length; i < len; i++) {
            const code = str.charCodeAt(i);
            if (
              !(code > 47 && code < 58) && // numeric
              !(code > 64 && code < 91) && // upper alpha
              code !== 95 && // underscore
              !(code > 96 && code < 123)
            ) {
              // lower alpha
              endIndex = i;
              break;
            }
          }

          if (endIndex === -1) {
            // delimeter not found
            variable = str.substring(index);
          } else {
            // delimeted found
            variable = str.substring(index, endIndex);
          }
        }
        if (!variable) {
          result += '$';
        }
      }
      position = endIndex;
      if (!variable) {
        return substituteVariablesInternal(str, position, result, context);
      } else {
        const { error, value } = substituteVariable(variable, context);
        if (error && !context.ignoreErrors) {
          return { error, value };
        }
        if (value != null) {
          result += String(value);
        }
        return substituteVariablesInternal(str, position, result, context);
      }
    }
  }
}

function substituteVariable(variable: string, context: Context): Result {
  let value: string;
  const error = undefined;
  let s = variable.split(':', 2);
  if (s.length === 2) {
    const [name, modifier] = s;
    value = resolveVariable(context, name);
    if (modifier[0] === '+') {
      // Substitute replacement, but only if variable is defined and nonempty. Otherwise, substitute nothing
      value = value ? modifier.substring(1) : '';
    } else if (modifier[0] === '-') {
      // Substitute the value of variable, but if that is empty or undefined, use default instead
      value = value || modifier.substring(1);
    } else if (modifier[0] === '#') {
      // Substitute with the length of the value of the variable
      value = value !== undefined ? '' + String(value).length : '0';
    } else if (modifier[0] === '=') {
      // Substitute the value of variable, but if that is empty or undefined, use default instead and set the variable to default
      if (!value) {
        value = modifier.substring(1);
        context.cachedEnv[name] = value;
      }
    } else if (modifier[0] === '?') {
      // If variable is defined and not empty, substitute its value. Otherwise, print message as an error message.
      if (!value) {
        if (modifier.length > 1) {
          return {
            error: { message: name + ': ' + modifier.substring(1) },
            value: '',
          };
        } else {
          return {
            error: { message: name + ': parameter null or not set' },
            value: '',
          };
        }
      }
    }
  } else {
    // replace like "${VAR/a/b}"
    s = variable.split('/', 3);
    if (s.length === 3) {
      const [name, search, replacement] = s;
      value = resolveVariable(context, name);
      value = value ? String(value).replace(search, replacement) : '';
    } else {
      value = resolveVariable(context, variable);
    }
  }
  return { error, value };
}
