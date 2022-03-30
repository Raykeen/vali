import type { Nullable } from './utilityTypes';

export type ValidationResult<ErrorType, ChildrenValidationResults extends FormValidationResults | null = null> =
  | {
      isValid: true;
      error: null;
      result: ChildrenValidationResults;
    }
  | {
      isValid: false;
      error: ErrorType;
      result: ChildrenValidationResults;
    };

export type FormValidationResults = Record<string, ValidationResult<any, any>>;

export interface ValidationFunctionAdapted<Value, Result extends ValidationResult<any, any>> {
  (value: Value): Result;
}

export type FormValidationsBase = Record<
  string,
  IValidator<any, ErrorTypes, ValidationResult<ErrorTypes, FormValidationResults | null>>
>;

type ExtractValue<V> = V extends IValidator<infer Value, ErrorTypes, ValidationResult<ErrorTypes, null>> ? Value : unknown;

export type Form<FormValidations extends FormValidationsBase> = {
  [K in keyof FormValidations]: ExtractValue<FormValidations[K]>;
};

export type FormFieldsValidationResults<FormValidations extends FormValidationsBase> = {
  [K in keyof FormValidations]: FormValidations[K] extends IValidator<any, ErrorTypes, infer R> ? R : never;
};

export type ErrorTypes = string | object | symbol | (() => string | object | symbol);

export type RequireableValue = Nullable<object | string | number | null | undefined | Array<any>>;

export type CountableValue = Nullable<string | object | null | undefined | Array<any>>;

export type NumericValue = Nullable<string | number>;

export interface IValidator<
  Value,
  ErrorType extends ErrorTypes,
  VResult extends ValidationResult<ErrorType, any>,
> {
  validate: (value: Value, context: any) => VResult;
}
