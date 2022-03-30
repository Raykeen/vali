import { RequireableValue } from '../types';

export const hasMeaningfulValue = (value: RequireableValue): value is NonNullable<RequireableValue> =>
  (typeof value === 'number' && Number.isFinite(value)) ||
  (Array.isArray(value) && value.length > 0) ||
  (typeof value === 'string' && value.length > 0) ||
  ((value instanceof Map || value instanceof Set) && value.size > 0) ||
  (typeof value === 'object' && value && Object.keys(value).length > 0) ||
  false;