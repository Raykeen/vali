export function mapValues<O extends object, R>(object: O, func: (value: O[keyof O], key: keyof O) => R) {
  return Object.entries(object).reduce((result, [key, value]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    result[key] = func(value, key);
    return result;
  }, {} as Record<keyof O, R>);
}
