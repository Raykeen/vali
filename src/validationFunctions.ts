import { hasMeaningfulValue } from './utils/hasMeaningfulValue';
import { CountableValue, NumericValue, RequireableValue } from './types';

export function validateRequireness(value: RequireableValue) {
  return hasMeaningfulValue(value);
}

export function validateLength(value: CountableValue, { min = -Infinity, max = +Infinity }): boolean {
  if (!hasMeaningfulValue(value)) {
    return true;
  }

  let length = 0;

  if (typeof value === 'string' || 'length' in value) {
    length = value.length;
  } else if (value instanceof Map || value instanceof Set) {
    length = value.size;
  } else if (typeof value === 'object') {
    length = Object.keys(value).length;
  }

  return length >= min && length <= max;
}

export function validateRange(value: NumericValue, { min = -Infinity, max = +Infinity }) {
  const numberVal = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (typeof numberVal === 'number' && Number.isNaN(numberVal)) {
    return false;
  }

  if (!hasMeaningfulValue(numberVal)) {
    return true;
  }

  return numberVal >= min && numberVal <= max;
}
