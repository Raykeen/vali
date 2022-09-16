import type { Nullable } from './utilityTypes';
import { Vali } from './Vali';

export type ValidationResult<ErrorType, ChildrenValidationResults extends FormFieldsValidationResults<any, any> | null = null> = {
  isValid: boolean;
  error: null | ErrorType;
  result: ChildrenValidationResults;
};

export interface ValidationFunctionAdapted<Value, Context, Result extends ValidationResult<any, any>> {
  (value: Value, context: Context): Result;
}

export type FormValidations<Form, Context, ErrorType extends ErrorTypes = ErrorTypes> = Form extends Record<string, unknown> ? Partial<{
  [K in keyof Form]: ((V: Vali<Form[K], Context, ErrorType, null>) => IValidator<any, Context, ErrorType>);
}> : object;

type ExtractValue<V> = V extends IValidator<infer Value, any, ErrorTypes, null> ? Value : unknown;

export type FormFieldsValidationResults<Validations extends FormValidations<any, any>, Context> = {
  [K in keyof Validations]: Validations[K] extends (V: any) => IValidator<any, Context, infer E, infer R>
    ? ValidationResult<E, R>
    : never;
};

export type ErrorTypes = string | object | symbol | (() => string | object | symbol);

export type RequireableValue = Nullable<object | string | number | null | undefined | Array<unknown>>;

export type CountableValue = Nullable<string | object | null | undefined | Array<unknown>>;

export type NumericValue = Nullable<string | number>;

export interface IValidator<
  Value,
  Context,
  ErrorType extends ErrorTypes,
  ChildrenVResults extends FormFieldsValidationResults<any, Context> | null = any,
> {
  validate: (value: Value, ...rest: (Context extends null ? [undefined?] : [Context])) => ValidationResult<ErrorType, ChildrenVResults>;
}
